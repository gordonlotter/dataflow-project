// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // Replace with your Supabase URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Replace with your Supabase anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function DshbordRolesTble() {
  interface Role {
    role_id: string;
    role_name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
  }

  // 1. Define ALL TypeScript interfaces HERE (inside function)
  // 2. React hooks
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Effects and handlers
  useEffect(function() {
    loadRoles();
  }, []);

  async function loadRoles() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('role_id, role_name, description, created_at, updated_at')
        .order('role_name', { ascending: true });

      if (error) {
        throw error;
      }

      setRoles(data || []);
    } catch (e: any) {
      console.error("Error loading roles:", e);
      setError(e.message || "Failed to load roles.");
    } finally {
      setLoading(false);
    }
  }

  // 4. Return JSX with Tailwind semantic tokens
  return (
    <div className="container mx-auto p-6 bg-background space-y-6">
      <Card className="bg-card text-card-foreground shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Roles Overview</CardTitle>
          <CardDescription className="text-muted-foreground">
            A comprehensive list of all defined roles in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading roles...</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && roles.length === 0 && (
            <div className="text-center p-4 text-muted-foreground">
              No roles found.
            </div>
          )}

          {!loading && !error && roles.length > 0 && (
            <div className="overflow-x-auto border border-border rounded-md">
              <Table className="min-w-full">
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="w-[100px] text-muted-foreground">Role ID</TableHead>
                    <TableHead className="text-muted-foreground">Role Name</TableHead>
                    <TableHead className="text-muted-foreground">Description</TableHead>
                    <TableHead className="text-muted-foreground">Created At</TableHead>
                    <TableHead className="text-muted-foreground">Updated At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map(function(role) {
                    return (
                      <TableRow key={role.role_id} className="hover:bg-accent/50">
                        <TableCell className="font-mono text-xs text-muted-foreground">{role.role_id.substring(0, 8)}...</TableCell>
                        <TableCell className="font-medium text-foreground">{role.role_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {role.description || <span className="italic text-muted-foreground">No description</span>}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(role.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(role.updated_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// In a real application, you would typically export this component for use in other files.
// For example:
// export default DshbordRolesTble;

// If you are rendering this directly for demonstration, ensure `render` is defined or remove it.
// e.g., if rendering with ReactDOM:
// import ReactDOM from 'react-dom/client';
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<DshbordRolesTble />);