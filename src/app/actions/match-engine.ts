'use server';

import { serverDb } from '@/lib/firebase-server';
import { collection, getDocs, query, where, doc, getDoc, updateDoc, addDoc, serverTimestamp, setDoc, limit } from 'firebase/firestore';

// Types representing the database schema Constraints
interface UserProfile {
  uid: string;
  name: string;
  year?: string; 
  campus?: string;
  major?: string;
  nativeLanguage?: string;
  targetLanguage?: string;
  academicGoals?: string;
  socialGoals?: string;
  lastSeen?: any;
  isHidden?: boolean;
}

interface SwipeAction {
  initiatorId: string;
  targetId: string;
  action: 'LIKE' | 'PASS' | 'BLOCK';
  timestamp: any;
}

/**
 * 1. Dynamic Constraint Audit & Filter Layer
 * Excludes invalid candidates: self, already swiped, blocked, hidden, and demographically mismatched.
 */
async function filterValidCandidates(currentUserId: string, allUsers: UserProfile[], constraints?: any) {
  // Fetch users the current user has already swiped on to exclude them
  const swipesRef = collection(serverDb, 'swipes');
  const swipesQuery = query(swipesRef, where('initiatorId', '==', currentUserId));
  const swipedDocs = await getDocs(swipesQuery);
  const swipedIds = new Set(swipedDocs.docs.map(d => d.data().targetId));

  return allUsers.filter(user => {
    // Basic Exclusions
    if (user.uid === currentUserId) return false;
    if (swipedIds.has(user.uid)) return false;
    if (user.isHidden) return false;

    // Hard Constraint Exclusions (if provided via search)
    if (constraints) {
      if (constraints.campus && user.campus !== constraints.campus) return false;
      if (constraints.nativeLanguage && user.nativeLanguage !== constraints.nativeLanguage) return false;
      
      // Age Mapping (Heuristic mapping 'year' string to an approximate age bracket if requested)
      if (constraints.minAge || constraints.maxAge) {
        const yearInt = parseInt(user.year?.replace(/\D/g, '') || '1');
        const approxAge = 18 + yearInt; 
        if (constraints.minAge && approxAge < constraints.minAge) return false;
        if (constraints.maxAge && approxAge > constraints.maxAge) return false;
      }
    }

    return true;
  });
}

/**
 * Helper: Calculate Semantic Text Overlap (Fallback for missing Vector DB)
 * Tokenizes text and calculates Jaccard similarity coefficient.
 */
function calculateSemanticOverlap(textA: string = '', textB: string = '') {
  const normalize = (t: string) => t.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  const setA = new Set(normalize(textA));
  const setB = new Set(normalize(textB));
  if (setA.size === 0 || setB.size === 0) return 0;
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  return intersection.size / union.size; // 0.0 to 1.0
}

/**
 * 2. AI Discovery Feed Algorithm (The Feed)
 * Scores candidates combining Semantic Similarity, Mutual Preferences, and Activity Recency.
 */
export async function getDiscoveryFeed(userId: string) {
  // Fetch current user
  const currentUserDoc = await getDoc(doc(serverDb, 'users', userId));
  if (!currentUserDoc.exists()) throw new Error("User not found");
  const currentUser = currentUserDoc.data() as UserProfile;

  // Fetch all potential users (In production, use cursor pagination or geo-hashing)
  const usersQuery = query(collection(serverDb, 'users'), limit(200));
  const usersSnapshot = await getDocs(usersQuery);
  const allUsers = usersSnapshot.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));

  // 1. Filter
  const validCandidates = await filterValidCandidates(userId, allUsers);

  // 2. Score
  const scoredCandidates = validCandidates.map(candidate => {
    let score = 0;

    // A. Mutual Preferences Overlap (Language Reciprocity) -> Heavily Weighted (+40)
    if (candidate.nativeLanguage === currentUser.targetLanguage) score += 20;
    if (candidate.targetLanguage === currentUser.nativeLanguage) score += 20;

    // B. Semantic Bio Similarity (via fast heuristic) -> (+40)
    const academicSim = calculateSemanticOverlap(currentUser.academicGoals, candidate.academicGoals);
    const socialSim = calculateSemanticOverlap(currentUser.socialGoals, candidate.socialGoals);
    score += (academicSim + socialSim) * 20; 

    // C. Activity Recency -> (+20)
    if (candidate.lastSeen) {
      const daysSinceActive = (Date.now() - candidate.lastSeen.toMillis()) / (1000 * 60 * 60 * 24);
      if (daysSinceActive < 1) score += 20;
      else if (daysSinceActive < 7) score += 10;
    }

    // Add slight randomness to break ties and keep feed fresh
    score += Math.random() * 5;

    return { profile: candidate, matchScore: Math.round(score) };
  });

  // 3. Rank & Return Top 20
  scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);
  return scoredCandidates.slice(0, 20);
}

/**
 * 3. Advanced Search & Query Engine (The Search Bar)
 * Allows explicit filtering layer with semantic fallback.
 */
export async function searchUsers(userId: string, searchParams: { 
  query?: string; 
  maxDistance?: number; // Represented as logical distance if using pure strings
  minAge?: number; 
  maxAge?: number; 
  tags?: string[];
  campus?: string;
}) {
  const usersSnapshot = await getDocs(query(collection(serverDb, 'users'), limit(500)));
  const allUsers = usersSnapshot.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));

  // Apply Hard Constraints & Swipe Checks
  let results = await filterValidCandidates(userId, allUsers, {
    campus: searchParams.campus,
    minAge: searchParams.minAge,
    maxAge: searchParams.maxAge,
  });

  // Explicit Filtering by Tags
  if (searchParams.tags && searchParams.tags.length > 0) {
    const tagsLower = searchParams.tags.map(t => t.toLowerCase());
    results = results.filter(user => {
      const userText = `${user.major} ${user.academicGoals} ${user.socialGoals}`.toLowerCase();
      return tagsLower.some(tag => userText.includes(tag));
    });
  }

  // Semantic/Keyword Similarity for Text Query
  if (searchParams.query) {
    const queryLower = searchParams.query.toLowerCase();
    
    const scoredResults = results.map(user => {
      // Prioritize exact text matches slightly higher, fallback to semantic overlap
      const exactMatch = `${user.name} ${user.major}`.toLowerCase().includes(queryLower);
      const bioOverlap = calculateSemanticOverlap(searchParams.query, `${user.academicGoals} ${user.socialGoals}`);
      
      return {
        ...user,
        searchRelevance: exactMatch ? 1.0 : bioOverlap
      };
    });

    // Filter out completely irrelevant results and sort
    results = scoredResults
      .filter(u => u.searchRelevance > 0.05)
      .sort((a, b) => b.searchRelevance - a.searchRelevance);
  }

  return results.slice(0, 50);
}

/**
 * 4. Mutual Match Verification
 * Final swipe listener execution. Updates DB and returns mutual match state.
 */
export async function swipeUser(initiatorId: string, targetId: string, action: 'LIKE' | 'PASS' | 'BLOCK') {
  // 1. Record the swipe
  await addDoc(collection(serverDb, 'swipes'), {
    initiatorId,
    targetId,
    action,
    timestamp: serverTimestamp()
  });

  // 2. Check for reciprocal LIKE if this is a LIKE
  if (action === 'LIKE') {
    const reciprocalQuery = query(
      collection(serverDb, 'swipes'),
      where('initiatorId', '==', targetId),
      where('targetId', '==', initiatorId),
      where('action', '==', 'LIKE')
    );
    
    const reciprocalSnap = await getDocs(reciprocalQuery);
    
    if (!reciprocalSnap.empty) {
      // Mutual Match Found! Establish the Connection
      const matchDoc = {
        participants: [initiatorId, targetId],
        status: 'accepted', // Auto-accept since both liked
        createdAt: serverTimestamp(),
        newlyAcceptedFor: initiatorId // Flag to notify the initiator
      };
      
      const newMatchRef = await addDoc(collection(serverDb, 'matches'), matchDoc);
      
      // Also notify the target user
      await addDoc(collection(serverDb, 'notifications'), {
        recipientId: targetId,
        senderId: initiatorId,
        type: 'NEW_MATCH',
        title: "It's a Match!",
        body: "You and a new friend liked each other.",
        link: "/matches",
        isRead: false,
        createdAt: serverTimestamp()
      });

      return { mutualMatch: true, matchId: newMatchRef.id };
    }
  }

  return { mutualMatch: false };
}
