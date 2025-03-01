
import React from 'react';
import { UserRound, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from 'sonner';

interface User {
  id: number;
  name: string;
  publicKey: string;
}

interface UsersListProps {
  users: User[];
  onSelectPublicKey: (publicKey: string) => void;
  selectedPublicKey?: string;
}

const UsersList: React.FC<UsersListProps> = ({ users, onSelectPublicKey, selectedPublicKey }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((user) => {
        const isSelected = user.publicKey === selectedPublicKey;
        
        return (
          <Card key={user.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-5 w-5" />
                {user.name}
              </CardTitle>
              <CardDescription>Public Key:</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground break-all mb-4">
                {`${user.publicKey.slice(0, 32)}...`}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(user.publicKey);
                    toast.success('Public key copied to clipboard');
                  }}
                >
                  <Key className="mr-2 h-4 w-4" />
                  Copy Key
                </Button>
                <Button
                  size="sm"
                  variant={isSelected ? "secondary" : "default"}
                  onClick={() => {
                    onSelectPublicKey(user.publicKey);
                    toast.success(`Selected ${user.name} as recipient`);
                  }}
                >
                  {isSelected ? 'Selected' : 'Select as Recipient'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default UsersList;
