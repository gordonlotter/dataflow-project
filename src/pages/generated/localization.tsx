LocalizationPage() {
  const [currencies, setCurrencies] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadConnectionAndData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Please log in to view data');

        const { data: connections, error: connError } = await supabase
          .from('database_connections')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .limit(1);

        if (connError) throw connError;
        if (!connections || connections.length === 0) {
          throw new Error('No database connection found. Please connect a database first.');
        }

        const connId = connections[0].id;

        const { data: currenciesResult, error: currError } = await supabase.functions.invoke('db-query', {
          body: {
            connectionId: connId,
            query: 'SELECT * FROM currencies ORDER BY code'
          }
        });

        if (currError) throw new Error(`Failed to fetch currencies: ${currError.message}`);

        const { data: languagesResult, error: langError } = await supabase.functions.invoke('db-query', {
          body: {
            connectionId: connId,
            query: 'SELECT * FROM languages ORDER BY code'
          }
        });

        if (langError) throw new Error(`Failed to fetch languages: ${langError.message}`);

        setCurrencies(currenciesResult?.data || []);
        setLanguages(languagesResult?.data || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadConnectionAndData();
  }, []);

  const filteredCurrencies = (Array.isArray(currencies) ? currencies : []).filter(currency =>
    currency.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLanguages = (Array.isArray(languages) ? languages : []).filter(language =>
    language.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    language.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading localization data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-background min-h-screen">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Localization</h1>
        <p className="text-muted-foreground mt-1">Manage currencies and languages for your platform.</p>
      </header>

      <div className="mb-6 max-w-md">
        <Input
          type="text"
          placeholder="Search currencies or languages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Currencies</CardTitle>
            <CardDescription>Available currencies ({filteredCurrencies.length})</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCurrencies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No currencies found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Symbol</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCurrencies.map((currency, idx) => (
                    <TableRow key={currency.id || idx}>
                      <TableCell className="font-medium">{currency.code}</TableCell>
                      <TableCell>{currency.name}</TableCell>
                      <TableCell>{currency.symbol}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
            <CardDescription>Available languages ({filteredLanguages.length})</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLanguages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No languages found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Native Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLanguages.map((language, idx) => (
                    <TableRow key={language.id || idx}>
                      <TableCell className="font-medium">{language.code}</TableCell>
                      <TableCell>{language.name}</TableCell>
                      <TableCell>{language.native_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

render(<LocalizationPage />);