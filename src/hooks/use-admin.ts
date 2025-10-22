'use client';

import { useFirestore, useUser, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import type { UserRole } from '@/lib/types';

export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const roleDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'roles', user.uid) : null),
    [user, firestore]
  );

  const { data: userRole, isLoading: isRoleLoading } = useDoc<UserRole>(roleDocRef);

  const isAdmin = !!userRole?.roles?.includes('admin');

  return {
    isAdmin,
    isAdminLoading: isUserLoading || isRoleLoading,
  };
}
