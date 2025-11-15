function SerchFieldsFilters() {
  interface Language {
    id: string;
    lang_code: string;
    lang_name: string;
    created_at: string;
  }
  interface Currency {
    id: string;
    currency_code: string;
    currency_name: string;
    currency_symbol: string;
    created_at: string;
  }
  interface LanguageCurrencyLink {
    language: Language;
    currency: Currency;
  }

  // 1. Define ALL TypeScript interfaces HERE (inside function)
  // 2. React hooks
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>('');
  const [selectedCurrencyFilter, setSelectedCurrencyFilter] = useState<string>('');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [linkedData, setLinkedData] = useState<LanguageCurrencyLink[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Effects and handlers
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch languages
      const { data: languagesData, error: languagesError } = await supabase
        .from('languages')
        .select('*')
        .order('lang_name', { ascending: true });

      if (languagesError) throw languagesError;
      setLanguages(languagesData || []);

      // Fetch currencies
      const { data: currenciesData, error: currenciesError } = await supabase
        .from('currencies')
        .select('*')
        .order('currency_name', { ascending: true });

      if (currenciesError) throw currenciesError;
      setCurrencies(currenciesData || []);

      // For demonstration, let's create a hypothetical link.
      // In a real scenario, you'd likely have a linking table or
      // a way to determine which languages are associated with which currencies.
      // For now, we'll just demonstrate combining them hypothetically.
      const transformedLinkedData: LanguageCurrencyLink[] = [];
      const maxLength = Math.max(languagesData.length, currenciesData.length);

      for (let i = 0; i < maxLength; i++) {
        const language = languagesData[i % languagesData.length]; // cycle through languages
        const currency = currenciesData[i % currenciesData.length]; // cycle through currencies
        if (language && currency) {
          transformedLinkedData.push({ language, currency });
        }
      }
      setLinkedData(transformedLinkedData);

    } catch (err: any) {
      console.error("Error loading data:", err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredLinkedData = useMemo(() => {
    let filtered = linkedData;

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.language.lang_name.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.language.lang_code.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.currency.currency_name.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.currency.currency_code.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (selectedLanguageFilter) {
      filtered = filtered.filter(item => item.language.id === selectedLanguageFilter);
    }

    if (selectedCurrencyFilter) {
      filtered = filtered.filter(item => item.currency.id === selectedCurrencyFilter);
    }

    return filtered;
  }, [linkedData, searchTerm, selectedLanguageFilter, selectedCurrencyFilter]);

  // 4. Return JSX with Tailwind semantic tokens
  return (
    <div className="container mx-auto p-6 bg-background text-foreground">
      <Card className="bg-card text-card-foreground shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Currencies and Languages</CardTitle>
          <CardDescription className="text-muted-foreground">Search and filter linked currency and language information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input
              type="text"
              placeholder="Search by language or currency name/code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="col-span-full md:col-span-1"
            />
            <Select
              value={selectedLanguageFilter}
              onValueChange={setSelectedLanguageFilter}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Languages</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.lang_name} ({lang.lang_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedCurrencyFilter}
              onValueChange={setSelectedCurrencyFilter}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Currencies</SelectItem>
                {currencies.map((curr) => (
                  <SelectItem key={curr.id} value={curr.id}>
                    {curr.currency_name} ({curr.currency_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading && (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading data...</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && (
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted hover:bg-muted">
                    <TableHead className="text-muted-foreground w-1/4">Language Name</TableHead>
                    <TableHead className="text-muted-foreground w-1/4">Language Code</TableHead>
                    <TableHead className="text-muted-foreground w-1/4">Currency Name</TableHead>
                    <TableHead className="text-muted-foreground w-1/4">Currency Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLinkedData.length > 0 ? (
                    filteredLinkedData.map((item, index) => (
                      <TableRow key={`${item.language.id}-${item.currency.id}-${index}`} className="hover:bg-accent/50">
                        <TableCell className="font-medium">{item.language.lang_name}</TableCell>
                        <TableCell>{item.language.lang_code}</TableCell>
                        <TableCell>{item.currency.currency_name}</TableCell>
                        <TableCell>{item.currency.currency_code}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No matching languages and currencies found.
                      </TableCell>
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

render(<SerchFieldsFilters />);