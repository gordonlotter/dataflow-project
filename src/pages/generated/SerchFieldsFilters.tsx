interface Language {
  id: number;
  name: string;
  iso_code: string;
  currency_id?: number; // Assuming a potential link
}

interface Currency {
  id: number;
  name: string;
  code: string;
  symbol: string;
}

function SerchFieldsFilters() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch languages
      const { data: langData, error: langError } = await supabase
        .from('languages')
        .select('id, name, iso_code, currency_id'); // Assuming currency_id might exist in languages table for linking

      if (langError) throw langError;
      setLanguages(langData || []);

      // Fetch currencies
      const { data: currencyData, error: currencyError } = await supabase
        .from('currencies')
        .select('id, name, code, symbol');

      if (currencyError) throw currencyError;
      setCurrencies(currencyData || []);

    } catch (err: any) {
      console.error('Error fetching data:', err.message);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLanguages = languages.filter(lang => {
    const matchesSearchTerm = searchTerm === '' ||
      lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.iso_code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCurrency = selectedCurrencyId === '' ||
      (lang.currency_id !== undefined && lang.currency_id.toString() === selectedCurrencyId);

    return matchesSearchTerm && matchesCurrency;
  });

  const getCurrencyNameForLanguage = (language: Language) => {
    if (language.currency_id) {
      const linkedCurrency = currencies.find(curr => curr.id === language.currency_id);
      return linkedCurrency ? `${linkedCurrency.name} (${linkedCurrency.code})` : 'N/A';
    }
    return 'N/A';
  };

  return (
    <div className="container mx-auto p-6 bg-background text-foreground">
      <Card className="shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground p-4 rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Currencies and Languages</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              type="text"
              placeholder="Search by language name or ISO code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-2 border border-input rounded-md"
            />
            <Select
              value={selectedCurrencyId}
              onValueChange={setSelectedCurrencyId}
            >
              <SelectTrigger className="w-[200px] border border-input rounded-md">
                <SelectValue placeholder="Filter by Currency" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                <SelectItem value="">All Currencies</SelectItem>
                {currencies.map((currency) => (
                  <SelectItem key={currency.id} value={currency.id.toString()}>
                    {currency.name} ({currency.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchData} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Refresh Data
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading data...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full divide-y divide-border">
                <TableHeader className="bg-muted text-muted-foreground">
                  <TableRow>
                    <TableHead className="px-4 py-2 text-left text-sm font-semibold">Language Name</TableHead>
                    <TableHead className="px-4 py-2 text-left text-sm font-semibold">ISO Code</TableHead>
                    <TableHead className="px-4 py-2 text-left text-sm font-semibold">Linked Currency</TableHead>
                    <TableHead className="px-4 py-2 text-left text-sm font-semibold">Currency Code</TableHead>
                    <TableHead className="px-4 py-2 text-left text-sm font-semibold">Currency Symbol</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-background divide-y divide-border">
                  {filteredLanguages.length > 0 ? (
                    filteredLanguages.map((language) => {
                      const linkedCurrency = currencies.find(curr => curr.id === language.currency_id);
                      return (
                        <TableRow key={language.id} className="hover:bg-accent/50">
                          <TableCell className="px-4 py-2 text-sm">{language.name}</TableCell>
                          <TableCell className="px-4 py-2 text-sm">{language.iso_code}</TableCell>
                          <TableCell className="px-4 py-2 text-sm">{linkedCurrency ? linkedCurrency.name : 'N/A'}</TableCell>
                          <TableCell className="px-4 py-2 text-sm">{linkedCurrency ? linkedCurrency.code : 'N/A'}</TableCell>
                          <TableCell className="px-4 py-2 text-sm">{linkedCurrency ? linkedCurrency.symbol : 'N/A'}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="px-4 py-4 text-center text-sm text-muted-foreground">
                        No languages found matching your criteria.
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