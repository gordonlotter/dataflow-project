function AiProvidersList() {
  interface AiProviderConfig {
    id: string;
    name: string;
    provider_type: string;
    base_url: string;
    api_key_name: string;
    organization_id: string | null;
    model_name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    logo_url: string | null;
    additional_params: any; // JSONB type
  }

  const [providers, setProviders] = useState<AiProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAiProviders();
  }, []);

  const loadAiProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('db-query', {
        body: {
          connectionId: '308f1f01-282b-40bc-b2c2-d1c8228a8d62',
          query: 'SELECT * FROM ai_provider_configs ORDER BY created_at DESC'
        }
      });

      if (error) throw error;
      setProviders(data?.data || []);
    } catch (err: any) {
      console.error("Error loading AI providers:", err);
      setError(err.message || "Failed to load AI providers.");
      toast({
        title: "Error loading AI providers",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <p className="ml-3 text-lg text-muted-foreground">Loading AI Providers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="w-full max-w-2xl mx-auto mt-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={loadAiProviders} className="mt-4">Retry</Button>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-background">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">AI Provider Configurations</CardTitle>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Provider
          </Button>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No AI providers configured yet.</p>
              <p>Click "Add New Provider" to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Base URL</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {provider.logo_url && (
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={provider.logo_url} alt={provider.name} />
                            <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        <span>{provider.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{provider.provider_type}</TableCell>
                    <TableCell>{provider.model_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground break-all">{provider.base_url}</TableCell>
                    <TableCell className="text-center">
                      {provider.is_active ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => toast({ title: "Edit", description: `Edit ${provider.name}` })}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast({ title: "View Details", description: `Viewing ${provider.name} details` })}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => toast({ title: "Delete", description: `Delete ${provider.name}` })}>
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

render(<AiProvidersList />);