function SerchFieldsFilters() {
  interface Currency {
    id: number;
    code: string;
    name: string;
  }
  interface Language {
    id: number;
    name: string;
    code: string;
  }
  interface LinkedData {
    currency: Currency;
    languages: Language[];
  }

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [filteredData, setFilteredData] = useState<LinkedData[]>([]);
  const [currencySearch, setCurrencySearch] = useState<string>('');
  const [languageSearch, setLanguageSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [currencySearch, languageSearch, currencies, languages]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: connections } = await supabase
        .from('database_connections')
        .select('id')
        .eq('is_active', true)
        .single();

      if (!connections) {
        throw new Error("No active database connection found.");
      }
      const connectionId = connections.id;

      // Load Currencies
      const { data: currencyResult, error: currencyError } = await supabase.functions.invoke('db-query', {
        body: {
          connectionId,
          query: 'SELECT id, code, name FROM currencies'
        }
      });
      if (currencyError) throw currencyError;
      setCurrencies(currencyResult || []);


      // Load Languages
      const { data: languageResult, error: languageError } = await supabase.functions.invoke('db-query', {
        body: {
          connectionId,
          query: 'SELECT id, name, code FROM languages'
        }
      });
      if (languageError) throw languageError;
      setLanguages(languageResult || []);

    } catch (err: any) {
      console.error("Error loading data:", err.message);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const linkage: LinkedData[] = [];

    // For simplicity, we'll assume a many-to-many implicit linkage for now
    // In a real scenario, there would be a linking table or a foreign key.
    // Here, every currency is 'linked' to all languages for display purposes.

    const filteredCurrencies = currencies.filter(currency =>
      currency.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
      currency.code.toLowerCase().includes(currencySearch.toLowerCase())
    );

    const filteredLanguages = languages.filter(language =>
      language.name.toLowerCase().includes(languageSearch.toLowerCase()) ||
      language.code.toLowerCase().includes(languageSearch.toLowerCase())
    );

    filteredCurrencies.forEach(currency => {
      // In a real application, you'd fetch languages specifically linked to this currency
      linkage.push({
        currency,
        languages: filteredLanguages
      });
    });

    setFilteredData(linkage);
  };


  return (
    <div className="container mx-auto p-6 bg-background text-foreground">
      <Card className="bg-card shadow-lg">
        <CardHeader className="bg-card-foreground p-4 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-primary">Currencies and Languages</CardTitle>
          <CardDescription className="text-muted-foreground">Search and filter linked currencies and languages.</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              placeholder="Search by Currency Name or Code..."
              value={currencySearch}
              onChange={(e) => setCurrencySearch(e.target.value)}
              className="bg-input border-border focus:ring-ring focus:border-primary"
            />
            <Input
              placeholder="Search by Language Name or Code..."
              value={languageSearch}
              onChange={(e) => setLanguageSearch(e.target.value)}
              className="bg-input border-border focus:ring-ring focus:border-primary"
            />
          </div>

          {loading && <p className="text-center text-muted-foreground">Loading data...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <Table className="min-w-full bg-card">
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="text-left py-3 px-4 font-semibold text-muted-foreground">Currency Name</TableHead>
                    <TableHead className="text-left py-3 px-4 font-semibold text-muted-foreground">Currency Code</TableHead>
                    <TableHead className="text-left py-3 px-4 font-semibold text-muted-foreground">Linked Languages (Name - Code)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <TableRow key={item.currency.id} className="border-b border-border hover:bg-muted/50">
                        <TableCell className="py-3 px-4">{item.currency.name}</TableCell>
                        <TableCell className="py-3 px-4">{item.currency.code}</TableCell>
                        <TableCell className="py-3 px-4">
                          {item.languages.length > 0 ? (
                            <ul className="list-disc pl-5">
                              {item.languages.map((lang) => (
                                <li key={lang.id} className="text-sm">
                                  {lang.name} ({lang.code})
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-muted-foreground">No languages with applied filter</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">No data found matching your search.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}