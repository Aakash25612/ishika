
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home, Server } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-md text-center px-4"
      >
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <p className="mt-2 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/connections">
              <Server className="mr-2 h-4 w-4" />
              Connections
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
