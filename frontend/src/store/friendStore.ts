import { useState, useEffect } from 'react';

export type FriendStatus = 'online' | 'playing' | 'offline';

export type Friend = {
  key: string;
  name: string;
  rating: number;
  status: FriendStatus;
  addedAt: number;
};

export type ChallengeRequest = {
  id: string;
  fromKey: string;
  fromName: string;
  toKey: string;
  amountXLM: number;
  timeControl: string;
  createdAt: number;
  status: 'pending' | 'accepted' | 'declined';
};

const FRIENDS_KEY = 'kelkit_friends';
const CHALLENGES_KEY = 'kelkit_challenges';

function load<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}

let friends: Friend[] = load<Friend[]>(FRIENDS_KEY, []);
let challenges: ChallengeRequest[] = load<ChallengeRequest[]>(CHALLENGES_KEY, []);

const friendListeners = new Set<() => void>();
const challengeListeners = new Set<() => void>();

function notifyFriends() { friendListeners.forEach(f => f()); }
function notifyChallenges() { challengeListeners.forEach(f => f()); }

export function getFriends(): Friend[] { return friends; }
export function getChallenges(): ChallengeRequest[] { return challenges; }

export function addFriend(friend: Friend): boolean {
  if (friends.some(f => f.key === friend.key)) return false;
  friends = [friend, ...friends];
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
  notifyFriends();
  return true;
}

export function removeFriend(key: string) {
  friends = friends.filter(f => f.key !== key);
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
  notifyFriends();
}

export function sendChallenge(challenge: ChallengeRequest) {
  challenges = [challenge, ...challenges];
  localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
  notifyChallenges();
}

export function updateChallenge(id: string, status: 'accepted' | 'declined') {
  challenges = challenges.map(c => c.id === id ? { ...c, status } : c);
  localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
  notifyChallenges();
}

export function useFriendStore() {
  const [, r] = useState(0);
  useEffect(() => {
    const fn = () => r(n => n + 1);
    friendListeners.add(fn);
    return () => { friendListeners.delete(fn); };
  }, []);
  return friends;
}

export function useChallengeStore() {
  const [, r] = useState(0);
  useEffect(() => {
    const fn = () => r(n => n + 1);
    challengeListeners.add(fn);
    return () => { challengeListeners.delete(fn); };
  }, []);
  return challenges;
}
