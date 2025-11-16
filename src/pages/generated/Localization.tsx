function Localization() {
  interface Tenant {
    id: string;
    name: string;
    domain: string;
    is_active: boolean;
    contact_email: string;
    contact_phone: string;
    created_at: string;
  }

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // 'all', 'active', 'inactive'
  const { toast } = useToast();

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('db-query', {
        body: {
          connectionId: '308f1f01-282b-40bc-b2c2-d1c8228a8d62',
          query: 'SELECT id, name, domain, is_active, contact_email, contact_phone, created_at FROM tenants ORDER BY created_at DESC LIMIT 100'
        }
      });

      if (error) throw error;
      setTenants(result?.data || []);
    } catch (err: any) {
      toast({
        title: "Error loading tenants",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      tenant.name.toLowerCase().includes(searchTermLower) ||
      tenant.domain.toLowerCase().includes(searchTermLower) ||
      tenant.contact_email.toLowerCase().includes(searchTermLower);

    const matchesFilter = filterActive === 'all' || 
      (filterActive === 'active' && tenant.is_active) || 
      (filterActive === 'inactive' && !tenant.is_active);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tenants</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={loadTenants} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reload
          </Button>
          <Input 
            type="search" 
            placeholder="Search tenants..." 
            className="md:w-[100px] lg:w-[300px]" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <Select value={filterActive} onValueChange={setFilterActive}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.length > 0 ? (
                  filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell>{tenant.domain}</TableCell>
                      <TableCell><Badge variant={tenant.is_active ? 'default' : 'outline'}>{tenant.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                      <TableCell>{tenant.contact_email}</TableCell>
                      <TableCell>{new Date(tenant.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No tenants found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

render(<Localization />);