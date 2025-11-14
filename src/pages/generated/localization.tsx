LocalizationPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('id,name,domain,is_active,currency_code,language_code');

        if (error) throw error;

        setTenants(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, []);

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.domain && t.domain.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
           <p className="mt-2 text-sm">As a diagnostic step, this page is temporarily showing tenant data. The original error indicates an issue fetching 'currencies' or 'languages'. This helps confirm if the database connection is working for other tables.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white tracking-tight">Localization Diagnostics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Displaying Tenants to debug schema issues. The original page failed to load 'currencies' and 'languages'.
        </p>
      </header>

      <div className="mb-6">
        <div className="relative max-w-md">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
           <Input
            placeholder="Search by tenant name or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      <Card className="shadow-lg border-gray-200/50 dark:border-gray-800/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-xl font-semibold">
            <Users className="mr-3 h-6 w-6 text-blue-500" /> Tenants
          </CardTitle>
          <Badge variant="outline">{filteredTenants.length} found</Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Language</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.length > 0 ? (
                filteredTenants.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="text-gray-500 dark:text-gray-400">{t.domain}</TableCell>
                    <TableCell className="font-mono text-sm">{t.currency_code}</TableCell>
                    <TableCell className="font-mono text-sm">{t.language_code}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={t.is_active ? 'default' : 'secondary'}
                        className={t.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}
                      >
                        {t.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}

render(<LocalizationPage />);