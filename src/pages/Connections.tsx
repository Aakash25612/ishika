
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Connection, ConnectionType } from "@/types/connection";
import { getConnections, addConnection, updateConnection, removeConnection } from "@/services/connectionService";
import ConnectionCard from "@/components/connections/ConnectionCard";
import ConnectionForm from "@/components/connections/ConnectionForm";
import ConnectionFilter from "@/components/connections/ConnectionFilter";
import { Button } from "@/components/ui/button";
import { Plus, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Connections = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<Connection[]>([]);
  const [selectedType, setSelectedType] = useState<ConnectionType | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "active">("all");

  useEffect(() => {
    // Initialize connections from the service
    setConnections(getConnections());
  }, []);

  useEffect(() => {
    // Apply filters when connections or filters change
    let filtered = [...connections];
    
    if (selectedType !== null) {
      filtered = filtered.filter(conn => conn.type === selectedType);
    }
    
    if (activeTab === "active") {
      filtered = filtered.filter(conn => conn.isActive);
    }
    
    setFilteredConnections(filtered);
  }, [connections, selectedType, activeTab]);

  const handleAddConnection = (data: Omit<Connection, "id" | "createdAt" | "isActive">) => {
    try {
      const newConnection = addConnection({
        ...data,
        isActive: true
      });
      setConnections([...connections, newConnection]);
      toast.success("Connection added successfully");
    } catch (error) {
      toast.error("Failed to add connection");
      console.error(error);
    }
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    try {
      const updated = updateConnection(id, { isActive });
      if (updated) {
        setConnections(connections.map(conn => conn.id === id ? { ...conn, isActive } : conn));
        toast.success(`Connection ${isActive ? "activated" : "deactivated"}`);
      }
    } catch (error) {
      toast.error("Failed to update connection");
      console.error(error);
    }
  };

  const handleDelete = (id: string) => {
    try {
      const removed = removeConnection(id);
      if (removed) {
        setConnections(connections.filter(conn => conn.id !== id));
        toast.success("Connection removed");
      }
    } catch (error) {
      toast.error("Failed to remove connection");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Connection Management</h1>
              <p className="mt-2 text-muted-foreground">
                Manage your communication channels and places where steganography images can be shared
              </p>
            </div>
            <Button variant="outline" asChild className="gap-1">
              <Link to="/">
                <Link2 className="h-4 w-4" />
                Back to App
              </Link>
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <Tabs 
                value={activeTab} 
                onValueChange={(value) => setActiveTab(value as "all" | "active")}
                className="w-[400px]"
              >
                <TabsList>
                  <TabsTrigger value="all">All Connections</TabsTrigger>
                  <TabsTrigger value="active">Active Only</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Connection
              </Button>
            </div>
            
            <ConnectionFilter selectedType={selectedType} onSelectType={setSelectedType} />

            {filteredConnections.length === 0 ? (
              <div className="text-center py-10 bg-muted/20 rounded-lg border border-dashed">
                <p className="text-muted-foreground">No connections found</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSelectedType(null);
                    setActiveTab("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredConnections.map(connection => (
                  <ConnectionCard
                    key={connection.id}
                    connection={connection}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <ConnectionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleAddConnection}
      />
    </div>
  );
};

export default Connections;
