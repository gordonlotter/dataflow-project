function SerchFieldsFilters() {
  interface Language {
    id: string;
    name: string;
    code: string;
  }
  interface Currency {
    id: string;
    name: string;
    code: string;
    symbol: string;
    language_id: string | null; // Assuming a potential link
  }
  interface LinkedData {
    languageName: string;
    languageCode: string;
    currencyName: string;
    currencyCode: string;
    currencySymbol: string;
  }

  const [languages, setLanguages] = useState<Language[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [filteredData, setFilteredData] = useState<LinkedData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<Boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [languages, currencies, searchTerm, selectedLanguageFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data: connections } = await supabase
        .from('database_connections')
        .select('id')
        .eq('is_active', true)
        .single();

      if (!connections?.id) {
        console.error("No active database connection found.");
        setIsLoading(false);
        return;
      }

      const { data: languagesResult } = await supabase.functions.invoke('db-query', {
        body: {
          connectionId: connections.id,
          query: 'SELECT id, name, code FROM languages'
        }
      });
      setLanguages(languagesResult || []);

      const { data: currenciesResult } = await supabase.functions.invoke('db-query', {
        body: {
          connectionId: connections.id,
          query: 'SELECT id, name, code, symbol, language_id FROM currencies'
        }
      });
      setCurrencies(currenciesResult || []);

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    const linked: LinkedData[] = [];

    // Create a map for quick language lookup
    const languageMap = new Map<string, Language>();
    languages.forEach(lang => languageMap.set(lang.id, lang));

    currencies.forEach(currency => {
      const language = currency.language_id ? languageMap.get(currency.language_id) : undefined;

      const languageName = language?.name || 'N/A';
      const languageCode = language?.code || 'N/A';

      let include = true;

      // Search term filter
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchesCurrency = currency.name.toLowerCase().includes(lowerSearchTerm) ||
                                currency.code.toLowerCase().includes(lowerSearchTerm) ||
                                (currency.symbol && currency.symbol.toLowerCase().includes(lowerSearchTerm));
        const matchesLanguage = languageName.toLowerCase().includes(lowerSearchTerm) ||
                                languageCode.toLowerCase().includes(lowerSearchTerm);
        include = matchesCurrency || matchesLanguage;
      }

      // Language filter
      if (selectedLanguageFilter !== 'all' && languageCode !== selectedLanguageFilter) {
        include = false;
      }

      if (include) {
        linked.push({
          languageName: languageName,
          languageCode: languageCode,
          currencyName: currency.name,
          currencyCode: currency.code,
          currencySymbol: currency.symbol || 'N/A',
        });
      }
    });

    setFilteredData(linked);
  };

  return (
    <div className="container mx-auto p-6 bg-background text-foreground min-h-screen">
      <Card className="shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg p-4">
          <CardTitle className="text-2xl font-bold">Currencies and Languages</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow bg-card text-card-foreground border-border focus:ring-primary focus:border-primary"
            />
            <Select onValueChange={setSelectedLanguageFilter} value={selectedLanguageFilter}>
              <SelectTrigger className="w-[180px] bg-card text-card-foreground border-border focus:ring-primary focus:border-primary">
                <SelectValue placeholder="Filter by Language" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.code}>
                    {lang.name} ({lang.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => { setSearchTerm(''); setSelectedLanguageFilter('all'); }} className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
              Reset Filters
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading data...</div>
          ) : (
            <div className="overflow-x-auto border border-border rounded-lg">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px] text-muted-foreground">Language Name</TableHead>
                    <TableHead className="w-[100px] text-muted-foreground">Language Code</TableHead>
                    <TableHead className="text-muted-foreground">Currency Name</TableHead>
                    <TableHead className="w-[100px] text-muted-foreground">Currency Code</TableHead>
                    <TableHead className="w-[80px] text-right text-muted-foreground">Symbol</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <TableRow key={index} className="odd:bg-muted/50 even:bg-background">
                        <TableCell className="font-medium">{item.languageName}</TableCell>
                        <TableCell>{item.languageCode}</TableCell>
                        <TableCell>{item.currencyName}</TableCell>
                        <TableCell>{item.currencyCode}</TableCell>
                        <TableCell className="text-right">{item.currencySymbol}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No results found.
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