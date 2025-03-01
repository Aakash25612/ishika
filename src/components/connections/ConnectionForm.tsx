
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConnectionType } from "@/types/connection";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Facebook, Instagram, MessageCircle, Twitter } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.nativeEnum(ConnectionType),
  url: z.string().url("Please enter a valid URL"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ConnectionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({ open, onClose, onSubmit }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: ConnectionType.TELEGRAM,
      url: "",
      description: "",
    },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Connection</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connection Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connection Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a connection type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ConnectionType.TELEGRAM}>
                        <div className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          <span>Telegram</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={ConnectionType.FACEBOOK}>
                        <div className="flex items-center">
                          <Facebook className="h-4 w-4 mr-2" />
                          <span>Facebook</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={ConnectionType.INSTAGRAM}>
                        <div className="flex items-center">
                          <Instagram className="h-4 w-4 mr-2" />
                          <span>Instagram</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={ConnectionType.TWITTER}>
                        <div className="flex items-center">
                          <Twitter className="h-4 w-4 mr-2" />
                          <span>X.com</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Add Connection</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectionForm;
