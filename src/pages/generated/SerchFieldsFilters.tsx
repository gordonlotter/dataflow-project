function SerchFieldsFilters() {
  interface Language {
  id: number;
  name: string;
  code: string;
}
  interface Currency {
  id: number;
  name: string;
  code: string;
  symbol: string;
  language_id: number | null; // Assuming a foreign key link here
}

  const [languages, setLanguages] = useState<Language[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: langData, error: langError } = await supabase
        .from('languages')
        .select('id, name, code');

      if (langError) throw langError;
      setLanguages(langData || []);

      const { data: currData, error: currError } = await supabase
        .from('currencies')
        .select('id, name, code, symbol, language_id'); // Assuming language_id exists for linking

      if (currError) throw currError;
      setCurrencies(currData || []);

    } catch (err: any) {
      console.error("Error loading data:", err.message);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getLanguageName = (languageId: number | null) => {
    if (!languageId) return "N/A";
    const language = languages.find(lang => lang.id === languageId);
    return language ? language.name : "Unknown Language";
  };

  const filteredCurrencies = currencies.filter(currency => {
    const matchesSearchTerm = searchTerm.toLowerCase() === ''
      || currency.name.toLowerCase().includes(searchTerm.toLowerCase())
      || currency.code.toLowerCase().includes(searchTerm.toLowerCase())
      || (currency.symbol && currency.symbol.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLanguageFilter = selectedLanguageFilter === 'all'
      || (currency.language_id && currency.language_id.toString() === selectedLanguageFilter);

    return matchesSearchTerm && matchesLanguageFilter;
  });

  return (
    <div className="container mx-auto p-6 bg-background text-foreground min-h-screen">
      <Card className="shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground p-4 rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Currencies and Languages</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              type="text"
              placeholder="Search currencies by name, code, or symbol..."
              className="flex-grow bg-muted text-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select onValueChange={setSelectedLanguageFilter} value={selectedLanguageFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-muted text-foreground">
                <SelectValue placeholder="Filter by Language" />
              </SelectTrigger>
              <SelectContent className="bg-background text-foreground">
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id.toString()}>
                    {lang.name} ({lang.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={loadData} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Refresh Data
            </Button>
          </div>

          {loading && <p className="text-center text-muted-foreground">Loading data...</p>}
          {error && <p className="text-center text-destructive">{error}</p>}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <Table className="min-w-full divide-y divide-border">
                <TableHeader className="bg-primary/10">
                  <TableRow>
                    <TableHead className="py-3 px-4 text-left text-sm font-medium text-primary-foreground">Currency Name</TableHead>
                    <TableHead className="py-3 px-4 text-left text-sm font-medium text-primary-foreground">Currency Code</TableHead>
                    <TableHead className="py-3 px-4 text-left text-sm font-medium text-primary-foreground">Symbol</TableHead>
                    <TableHead className="py-3 px-4 text-left text-sm font-medium text-primary-foreground">Linked Language</TableHead>
                    <TableHead className="py-3 px-4 text-left text-sm font-medium text-primary-foreground">Language Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {filteredCurrencies.length > 0 ? (
                    filteredCurrencies.map((currency) => {
                      const linkedLanguage = languages.find(lang => lang.id === currency.language_id);
                      return (
                        <TableRow key={currency.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="py-3 px-4 whitespace-nowrap">{currency.name}</TableCell>
                          <TableCell className="py-3 px-4 whitespace-nowrap font-mono">{currency.code}</TableCell>
                          <TableCell className="py-3 px-4 whitespace-nowrap">{currency.symbol || 'N/A'}</TableCell>
                          <TableCell className="py-3 px-4 whitespace-nowrap">
                            {linkedLanguage ? linkedLanguage.name : 'Not Linked'}
                          </TableCell>
                          <TableCell className="py-3 px-4 whitespace-nowrap font-mono">
                            {linkedLanguage ? linkedLanguage.code : 'N/A'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="py-4 text-center text-muted-foreground">
                        No currencies found matching your criteria.
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