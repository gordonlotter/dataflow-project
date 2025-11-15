function AiProviderConfigs() {
  interface AiProviderConfig {
    id: string;
    provider_name: string;
    api_key: string;
    base_url: string;
    model_name: string;
    config_json: any; // Assuming JSONB type
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }

  const [data, setData] = useState<AiProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from('ai_provider_configs')
        .select('*');

      if (error) throw error;
      setData(result || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    let filtered = data;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.provider_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterActive !== 'all') {
      const isActive = filterActive === 'active';
      filtered = filtered.filter(item => item.is_active === isActive);
    }

    return filtered;
  }, [data, searchTerm, filterActive]);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container mx-auto p-6 bg-background">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">AI Provider Configurations</CardTitle>
          <CardDescription>Manage and view settings for various AI providers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search by provider name or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterActive} onValueChange={(value: 'all' | 'active' | 'inactive') => setFilterActive(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No AI provider configurations found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider Name</TableHead>
                    <TableHead>Model Name</TableHead>
                    <TableHead>Base URL</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Updated At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">{config.provider_name}</TableCell>
                      <TableCell>{config.model_name}</TableCell>
                      <TableCell>{config.base_url || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={config.is_active ? "default" : "outline"}>
                          {config.is_active ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(config.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(config.updated_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

render(<AiProviderConfigs />);