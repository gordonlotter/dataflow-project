function TenntDetilsList() {
  interface Tenant {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    is_active: boolean;
  }

  // 1. Define ALL TypeScript interfaces HERE (inside function)
  // 2. React hooks
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // 3. Effects and handlers
  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name, description, created_at, is_active')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setTenants(data as Tenant[]);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error fetching tenants",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 4. Return JSX with Tailwind semantic tokens
  return (
    <div className="container mx-auto p-6 bg-background">
      <Card className="bg-card text-card-foreground shadow-sm">
        <CardHeader className="border-b border-border p-4">
          <CardTitle className="text-2xl font-bold">Tenant Details List</CardTitle>
          <CardDescription className="text-muted-foreground">
            View and manage all registered tenants.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {loading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-lg text-muted-foreground">Loading tenants...</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="my-4">
              <X className="h-4 w-4" />
              <div className="ml-2">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </div>
            </Alert>
          )}

          {!loading && !error && tenants.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-12 h-12 mb-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-lg">No tenants found.</p>
              <p className="text-sm">It looks like there are no tenants registered yet.</p>
            </div>
          )}

          {!loading && !error && tenants.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted/80">
                  <TableHead className="w-[100px] text-muted-foreground">ID</TableHead>
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Description</TableHead>
                  <TableHead className="text-muted-foreground">Created At</TableHead>
                  <TableHead className="text-muted-foreground text-center">Status</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id} className="border-b border-border hover:bg-muted/50">
                    <TableCell className="font-medium text-foreground">{tenant.id.slice(0, 8)}...</TableCell>
                    <TableCell className="text-foreground">{tenant.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {tenant.description || 'N/A'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(tenant.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={tenant.is_active ? "default" : "secondary"}>
                        {tenant.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Placeholder for future actions like 'View' or 'Edit' */}
                      <Button variant="ghost" size="sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-4 h-4 mr-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

render(<TenntDetilsList />);