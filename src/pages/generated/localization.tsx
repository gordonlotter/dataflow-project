LocalizationPage() {
  const [currencies, setCurrencies] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadLocalizationData() {
      setLoading(true);
      setError(null);
      try {
        const { data: connection, error: connError } = await supabase
          .from('database_connections')
          .select('id')
          .eq('name', 'Integrations DB')
          .single();

        if (connError || !connection) {
          throw new Error('Database connection "Integrations DB" not found. Please connect the database first.');
        }

        const connectionId = connection.id;

        const [currenciesResponse, languagesResponse] = await Promise.all([
          supabase.functions.invoke('db-query', { body: { connectionId, query: 'SELECT * FROM currencies ORDER BY name' } }),
          supabase.functions.invoke('db-query', { body: { connectionId, query: 'SELECT * FROM languages ORDER BY name' } })
        ]);

        if (currenciesResponse.error) throw new Error(`Failed to fetch currencies: ${currenciesResponse.error.message}`);
        if (languagesResponse.error) throw new Error(`Failed to fetch languages: ${languagesResponse.error.message}`);

        const currenciesData = currenciesResponse.data?.data;
        const languagesData = languagesResponse.data?.data;
        
        if (!Array.isArray(currenciesData)) {
          console.error("Currencies data is not an array:", currenciesData);
          throw new Error("Received invalid format for currencies.");
        }
        
        if (!Array.isArray(languagesData)) {
          console.error("Languages data is not an array:", languagesData);
          throw new Error("Received invalid format for languages.");
        }

        setCurrencies(currenciesData || []);
        setLanguages(languagesData || []);
        
      } catch (err) {
        setError(err.message);
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLocalizationData();
  }, []);

  const filteredCurrencies = useMemo(() => {
    if (!searchTerm) return currencies;
    return (currencies || []).filter(currency =>
      currency.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currency.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currencies, searchTerm]);

  const filteredLanguages = useMemo(() => {
    if (!searchTerm) return languages;
    return (languages || []).filter(language =>
      language.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      language.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [languages, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading Localization Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Localization</h1>
        <p className="text-muted-foreground">Manage system-wide currencies and languages.</p>
      </header>

      <div className="mb-6 max-w-sm">
        <Input
          placeholder="Search by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Currencies</CardTitle>
            <CardDescription>
              A list of all available currencies in the system. Found {filteredCurrencies.length} currencies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Symbol</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCurrencies.length > 0 ? (
                  filteredCurrencies.map((currency) => (
                    <TableRow key={currency.id}>
                      <TableCell className="font-medium">{currency.code}</TableCell>
                      <TableCell>{currency.name}</TableCell>
                      <TableCell className="text-right">{currency.symbol}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No currencies found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
            <CardDescription>
              A list of all available languages in the system. Found {filteredLanguages.length} languages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Native Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((language) => (
                    <TableRow key={language.id}>
                       <TableCell className="font-medium">{language.code}</TableCell>
                       <TableCell>{language.name}</TableCell>
                       <TableCell>{language.native_name}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No languages found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

render(<LocalizationPage />);