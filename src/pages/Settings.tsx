
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Form, FormControl, FormDescription, 
  FormField, FormItem, FormLabel 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, TableBody, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { AlertCircle, Check, Key, Pencil, Plus, Save, Trash2, User, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Define schema for profile settings
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.string(),
  department: z.string(),
});

// Define schema for notification settings
const notificationFormSchema = z.object({
  emailAlerts: z.boolean(),
  expiryNotifications: z.boolean(),
  lowStockAlerts: z.boolean(),
  systemUpdates: z.boolean(),
  dailyReports: z.boolean(),
});

// Define schema for integration settings
const integrationFormSchema = z.object({
  apiKey: z.string().min(1, { message: "API Key is required" }),
  description: z.string(),
  service: z.string(),
});

// User type for permissions management
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: {
    inventory: "none" | "view" | "edit" | "admin";
    reports: "none" | "view" | "edit" | "admin";
    suppliers: "none" | "view" | "edit" | "admin";
    settings: "none" | "view" | "edit" | "admin";
  };
};

// Mock users data
const mockUsers: User[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@hospital.com",
    role: "Administrator",
    permissions: {
      inventory: "admin",
      reports: "admin",
      suppliers: "admin",
      settings: "admin",
    },
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    email: "michael.chen@hospital.com",
    role: "Pharmacist",
    permissions: {
      inventory: "edit",
      reports: "view",
      suppliers: "view",
      settings: "none",
    },
  },
  {
    id: "3",
    name: "Nurse Emily Rodriguez",
    email: "emily.rodriguez@hospital.com",
    role: "Nurse",
    permissions: {
      inventory: "view",
      reports: "view",
      suppliers: "none",
      settings: "none",
    },
  },
];

// Mock API keys
const mockApiKeys = [
  { id: "1", name: "Supplier API Integration", key: "sup_87x9a2b3c4d5e6f7g8h9i0", service: "Supplier Portal", createdAt: "2023-05-15" },
  { id: "2", name: "Analytics Service", key: "ana_76c5d4e3f2g1h0i9j8k7l6", service: "MedAnalytics", createdAt: "2023-04-10" },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState(mockApiKeys);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isAddingApiKey, setIsAddingApiKey] = useState(false);
  const { toast } = useToast();

  // Setup forms with their respective schemas
  const profileForm = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@hospital.com",
      role: "administrator",
      department: "pharmacy",
    },
  });

  const notificationForm = useForm({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailAlerts: true,
      expiryNotifications: true,
      lowStockAlerts: true,
      systemUpdates: false,
      dailyReports: true,
    },
  });

  const integrationForm = useForm({
    resolver: zodResolver(integrationFormSchema),
    defaultValues: {
      apiKey: "",
      description: "",
      service: "supplier",
    },
  });

  // Handle profile form submission
  const onProfileSubmit = (data: z.infer<typeof profileFormSchema>) => {
    toast({
      title: "Profile Updated",
      description: "Your profile settings have been updated successfully.",
    });
    console.log(data);
  };

  // Handle notification form submission
  const onNotificationSubmit = (data: z.infer<typeof notificationFormSchema>) => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
    console.log(data);
  };

  // Handle integration form submission
  const onIntegrationSubmit = (data: z.infer<typeof integrationFormSchema>) => {
    const newApiKey = {
      id: `${apiKeys.length + 1}`,
      name: data.description,
      key: `key_${Math.random().toString(36).substring(2, 15)}`,
      service: data.service === "supplier" ? "Supplier Portal" : 
               data.service === "analytics" ? "Analytics Service" : 
               "Custom Integration",
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    setApiKeys([...apiKeys, newApiKey]);
    setIsAddingApiKey(false);
    integrationForm.reset();
    
    toast({
      title: "API Key Generated",
      description: "A new API key has been created successfully.",
    });
  };

  // Toggle user permission level
  const togglePermission = (userId: string, module: keyof User['permissions'], level: "none" | "view" | "edit" | "admin") => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          permissions: {
            ...user.permissions,
            [module]: level
          }
        };
      }
      return user;
    }));
  };

  // Delete API key
  const deleteApiKey = (keyId: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== keyId));
    toast({
      title: "API Key Deleted",
      description: "The API key has been permanently deleted.",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your inventory management system preferences.
          </p>
        </div>

        <Card className="shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader>
              <div className="flex flex-col space-y-4">
                <div>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Manage your account settings and preferences.</CardDescription>
                </div>
                <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
                  <TabsTrigger value="profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="notifications">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="permissions">
                    <User className="mr-2 h-4 w-4" />
                    User Permissions
                  </TabsTrigger>
                  <TabsTrigger value="integrations">
                    <Key className="mr-2 h-4 w-4" />
                    Integrations
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>

            <CardContent>
              <TabsContent value="profile" className="mt-0">
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              This is your full name as it appears in the system.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormDescription>
                              Your email address for notifications and account recovery.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={profileForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="administrator">Administrator</SelectItem>
                                <SelectItem value="pharmacist">Pharmacist</SelectItem>
                                <SelectItem value="nurse">Nurse</SelectItem>
                                <SelectItem value="doctor">Doctor</SelectItem>
                                <SelectItem value="inventory-manager">Inventory Manager</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Your role determines your default permissions.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pharmacy">Pharmacy</SelectItem>
                                <SelectItem value="emergency">Emergency</SelectItem>
                                <SelectItem value="surgery">Surgery</SelectItem>
                                <SelectItem value="pediatrics">Pediatrics</SelectItem>
                                <SelectItem value="cardiology">Cardiology</SelectItem>
                                <SelectItem value="neurology">Neurology</SelectItem>
                                <SelectItem value="administration">Administration</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The department you primarily work with.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit">Save Profile Settings</Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="emailAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                              <FormDescription>
                                Receive notifications via email.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="expiryNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Expiry Alerts</FormLabel>
                              <FormDescription>
                                Get notified when medicines are about to expire.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="lowStockAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Low Stock Alerts</FormLabel>
                              <FormDescription>
                                Get notified when inventory items are running low.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="systemUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">System Updates</FormLabel>
                              <FormDescription>
                                Get notified about system updates and new features.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="dailyReports"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Daily Reports</FormLabel>
                              <FormDescription>
                                Receive daily inventory summary reports.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit">Save Notification Settings</Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="permissions" className="mt-0">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">User Permissions</h3>
                    <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New User</DialogTitle>
                          <DialogDescription>
                            Enter the details for the new user account.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <FormLabel className="text-right">Name</FormLabel>
                            <Input className="col-span-3" placeholder="Full Name" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <FormLabel className="text-right">Email</FormLabel>
                            <Input className="col-span-3" placeholder="Email Address" type="email" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <FormLabel className="text-right">Role</FormLabel>
                            <Select defaultValue="pharmacist">
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="administrator">Administrator</SelectItem>
                                <SelectItem value="pharmacist">Pharmacist</SelectItem>
                                <SelectItem value="nurse">Nurse</SelectItem>
                                <SelectItem value="doctor">Doctor</SelectItem>
                                <SelectItem value="inventory-manager">Inventory Manager</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddingUser(false)}>Cancel</Button>
                          <Button onClick={() => {
                            toast({
                              title: "User Added",
                              description: "New user has been added successfully.",
                            });
                            setIsAddingUser(false);
                          }}>Add User</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Inventory</TableHead>
                          <TableHead>Reports</TableHead>
                          <TableHead>Suppliers</TableHead>
                          <TableHead>Settings</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </TableCell>
                            {['inventory', 'reports', 'suppliers', 'settings'].map((module) => (
                              <TableCell key={module}>
                                <Select
                                  value={user.permissions[module as keyof User['permissions']]}
                                  onValueChange={(value) => 
                                    togglePermission(
                                      user.id, 
                                      module as keyof User['permissions'], 
                                      value as "none" | "view" | "edit" | "admin"
                                    )
                                  }
                                  disabled={user.id === '1' && module === 'settings'} // Can't change admin settings permissions
                                >
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="view">View</SelectItem>
                                    <SelectItem value="edit">Edit</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            ))}
                            <TableCell className="text-right">
                              {user.id !== '1' && ( // Can't delete the admin
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setUsers(users.filter(u => u.id !== user.id));
                                    toast({
                                      title: "User Removed",
                                      description: `${user.name} has been removed from the system.`,
                                    });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => {
                      toast({
                        title: "Permissions Saved",
                        description: "User permissions have been updated successfully.",
                      });
                    }}>
                      Save Permission Changes
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="integrations" className="mt-0">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">API Integrations</h3>
                    <Dialog open={isAddingApiKey} onOpenChange={setIsAddingApiKey}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Generate API Key
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Generate New API Key</DialogTitle>
                          <DialogDescription>
                            Create a new API key for external integrations.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...integrationForm}>
                          <form onSubmit={integrationForm.handleSubmit(onIntegrationSubmit)} className="space-y-4 py-4">
                            <FormField
                              control={integrationForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. Supplier Integration" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    A name to identify this API key's purpose.
                                  </FormDescription>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={integrationForm.control}
                              name="service"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Service Type</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select service" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="supplier">Supplier Portal</SelectItem>
                                      <SelectItem value="analytics">Analytics Service</SelectItem>
                                      <SelectItem value="custom">Custom Integration</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    The service this API key will be used for.
                                  </FormDescription>
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsAddingApiKey(false)}>Cancel</Button>
                              <Button type="submit">Generate Key</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>API Key</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apiKeys.map((apiKey) => (
                          <TableRow key={apiKey.id}>
                            <TableCell className="font-medium">{apiKey.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                                  {showApiKey === apiKey.id ? apiKey.key : '••••••••••••••••••••••••'}
                                </code>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                                >
                                  {showApiKey === apiKey.id ? "Hide" : "Show"}
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>{apiKey.service}</TableCell>
                            <TableCell>{apiKey.createdAt}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deleteApiKey(apiKey.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <h4 className="text-base font-medium mb-2">Available Integrations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Supplier Portal</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">Connect with supplier systems to automate ordering and inventory updates.</p>
                          <div className="mt-4 flex items-center text-sm">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                            Connected
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Analytics Service</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">Advanced analytics and reporting for inventory and supply chain optimization.</p>
                          <div className="mt-4 flex items-center text-sm">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                            Connected
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Electronic Medical Records</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">Integrate with EMR systems to track medication usage and patient treatments.</p>
                          <div className="mt-4 flex items-center text-sm">
                            <span className="flex h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                            Available
                          </div>
                          <Button variant="outline" size="sm" className="mt-2 w-full">
                            Connect
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </AppLayout>
  );
}
