function AiProviderConfigs() {
  interface AiProviderConfig {
    id: string;
    name: string;
    provider_type: string;
    base_url: string;
    api_key_name: string;
    organization_id: string;
    model_name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by: string;
    logo_url: string;
    additional_params: Record<string, any>;
  }

  const [configs, setConfigs] = useState<AiProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadAiProviderConfigs();
  }, []);

  const loadAiProviderConfigs = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('db-query', {
        body: {
          connectionId: '308f1f01-282b-40bc-b2c2-d1c8228a8d62',
          query: 'SELECT * FROM ai_provider_configs ORDER BY created_at DESC'
        }
      });

      if (error) throw error;
      setConfigs(result?.data || []);
    } catch (err: any) {
      toast({
        title: "Error loading AI Provider Configurations",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredConfigs = useMemo(() => {
    let filtered = configs;

    if (searchTerm) {
      filtered = filtered.filter(config =>
        config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.provider_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(config =>
        filterType === 'active' ? config.is_active : !config.is_active
      );
    }
    return filtered;
  }, [configs, searchTerm, filterType]);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="container mx-auto p-6 bg-background">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">AI Provider Configurations</CardTitle>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search by name or provider type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredConfigs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No AI provider configurations found.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredConfigs.map((config) => (
                <Card key={config.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      {config.logo_url && (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={config.logo_url} alt={config.name} />
                          <AvatarFallback>{config.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <CardTitle>{config.name}</CardTitle>
                        <CardDescription>{config.provider_type}</CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={config.is_active ? "default" : "secondary"}
                      className="absolute top-4 right-4"
                    >
                      {config.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p><strong>Model:</strong> {config.model_name || 'N/A'}</p>
                    <p><strong>Base URL:</strong> {config.base_url}</p>
                    <p><strong>API Key Name:</strong> {config.api_key_name}</p>
                    {config.organization_id && <p><strong>Org ID:</strong> {config.organization_id}</p>}
                    <p><strong>Created:</strong> {new Date(config.created_at).toLocaleDateString()}</p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

render(<AiProviderConfigs />);