interface Currency {
    id: string;
    code: string;
    name: string;
    symbol: string;
    decimal_places: number;
    is_active: boolean;
  }

interface Language {
    id: string;
    code: string;
    name: string;
    native_name: string;
    is_active: boolean;
  }

function Localization() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currencySearch, setCurrencySearch] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const [activeCurrencyFilter, setActiveCurrencyFilter] = useState<boolean | undefined>(undefined);
  const [activeLanguageFilter, setActiveLanguageFilter] = useState<boolean | undefined>(undefined);
  const { toast } = useToast();

  // Pagination states
  const [currencyPage, setCurrencyPage] = useState(1);
  const [currencyPageSize, setCurrencyPageSize] = useState(10);
  const [totalCurrencies, setTotalCurrencies] = useState(0);
  const [languagePage, setLanguagePage] = useState(1);
  const [languagePageSize, setLanguagePageSize] = useState(10);
  const [totalLanguages, setTotalLanguages] = useState(0);

  useEffect(() => {
    loadData();
  }, [currencyPage, currencyPageSize, languagePage, languagePageSize]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Currencies
      const { data: currencyResult, error: currencyError } = await supabase.functions.invoke('db-query', {
        body: {
          connectionId: '308f1f01-282b-40bc-b2c2-d1c8228a8d62',
          query: `SELECT id, code, name, symbol, decimal_places, is_active FROM currencies WHERE name ILIKE '%${currencySearch}%' ${activeCurrencyFilter !== undefined ? `AND is_active = ${activeCurrencyFilter}` : ''} ORDER BY name ASC LIMIT ${currencyPageSize} OFFSET ${(currencyPage - 1) * currencyPageSize}`
        }
      });
      if (currencyError) throw currencyError;
      setCurrencies(currencyResult?.data || []);

      // Fetch total currencies for pagination
      const { data: totalCurrencyResult, error: totalCurrencyError } = await supabase.functions.invoke('db-query', {
        body: {
          connectionId: '308f1f01-282b-40bc-b2c2-d1c8228a8d62',
          query: `SELECT COUNT(*) FROM currencies WHERE name ILIKE '%${currencySearch}%' ${activeCurrencyFilter !== undefined ? `AND is_active = ${activeCurrencyFilter}` : ''}`
        }
      });
      if (totalCurrencyError) throw totalCurrencyError;
      setTotalCurrencies(totalCurrencyResult?.data?.[0]?.count || 0);

      // Fetch Languages
      const { data: languageResult, error: languageError } = await supabase.functions.invoke('db-query', {
        body: {
          connectionId: '308f1f01-282b-40bc-b2c2-d1c8228a8d62',
          query: `SELECT id, code, name, native_name, is_active FROM languages WHERE name ILIKE '%${languageSearch}%' ${activeLanguageFilter !== undefined ? `AND is_active = ${activeLanguageFilter}` : ''} ORDER BY name ASC LIMIT ${languagePageSize} OFFSET ${(languagePage - 1) * languagePageSize}`
        }
      });
      if (languageError) throw languageError;
      setLanguages(languageResult?.data || []);

      // Fetch total languages for pagination
      const { data: totalLanguageResult, error: totalLanguageError } = await supabase.functions.invoke('db-query', {
        body: {
          connectionId: '308f1f01-282b-40bc-b2c2-d1c8228a8d62',
          query: `SELECT COUNT(*) FROM languages WHERE name ILIKE '%${languageSearch}%' ${activeLanguageFilter !== undefined ? `AND is_active = ${activeLanguageFilter}` : ''}`
        }
      });
      if (totalLanguageError) throw totalLanguageError;
      setTotalLanguages(totalLanguageResult?.data?.[0]?.count || 0);

    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'An unknown error occurred');
      toast({
        title: 'Error loading data',
        description: err.message || 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencySearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrencySearch(e.target.value);
    setCurrencyPage(1);
  }, []);

  const handleLanguageSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLanguageSearch(e.target.value);
    setLanguagePage(1);
  }, []);

  const applyFilters = () => {
    setCurrencyPage(1);
    setLanguagePage(1);
    loadData();
  };

  const resetFilters = () => {
    setCurrencySearch('');
    setLanguageSearch('');
    setActiveCurrencyFilter(undefined);
    setActiveLanguageFilter(undefined);
    setCurrencyPage(1);
    setLanguagePage(1);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading localization data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-destructive">
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadData} className="mt-4">Retry</Button>
      </div>
    );
  }

  const totalCurrencyPages = Math.ceil(totalCurrencies / currencyPageSize);
  const totalLanguagePages = Math.ceil(totalLanguages / languagePageSize);

  return (
    <div className="container mx-auto p-6 bg-background text-foreground min-h-screen">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary flex items-center">
            <Globe className="mr-3 h-7 w-7" />
            Localization Settings
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Manage currencies and languages supported across your platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="currencySearch">Search Currencies</Label>
            <Input
              id="currencySearch"
              placeholder="Search by currency name..."
              value={currencySearch}
              onChange={handleCurrencySearch}
              className="w-full"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="languageSearch">Search Languages</Label>
            <Input
              id="languageSearch"
              placeholder="Search by language name..."
              value={languageSearch}
              onChange={handleLanguageSearch}
              className="w-full"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="activeCurrencyFilter">Currency Status</Label>
            <Select
              onValueChange={(value) => setActiveCurrencyFilter(value === 'true' ? true : value === 'false' ? false : undefined)}
              value={activeCurrencyFilter === undefined ? 'all' : activeCurrencyFilter.toString()}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="activeLanguageFilter">Language Status</Label>
            <Select
              onValueChange={(value) => setActiveLanguageFilter(value === 'true' ? true : value === 'false' ? false : undefined)}
              value={activeLanguageFilter === undefined ? 'all' : activeLanguageFilter.toString()}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button onClick={resetFilters} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
          <Button onClick={applyFilters}>
            <Filter className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
        </CardFooter>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold flex items-center">
              <DollarSign className="mr-2 h-6 w-6" />
              Currencies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currencies.map((currency) => (
                  <TableRow key={currency.id}>
                    <TableCell className="font-medium">{currency.code}</TableCell>
                    <TableCell>{currency.name}</TableCell>
                    <TableCell>{currency.symbol}</TableCell>
                    <TableCell className="text-right">
                      {currency.is_active ? (
                        <Badge variant="default" className="bg-green-500">Yes</Badge>
                      ) : (
                        <Badge variant="destructive">No</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrencyPage((prev) => Math.max(prev - 1, 1))}
                disabled={currencyPage === 1}
              >
                Previous
              </Button>
              <span>Page {currencyPage} of {totalCurrencyPages}</span>
              <Button
                variant="outline"
                onClick={() => setCurrencyPage((prev) => Math.min(prev + 1, totalCurrencyPages))}
                disabled={currencyPage === totalCurrencyPages}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold flex items-center">
              <Languages className="mr-2 h-6 w-6" />
              Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Native Name</TableHead>
                  <TableHead className="text-right">Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {languages.map((language) => (
                  <TableRow key={language.id}>
                    <TableCell className="font-medium">{language.code}</TableCell>
                    <TableCell>{language.name}</TableCell>
                    <TableCell>{language.native_name}</TableCell>
                    <TableCell className="text-right">
                      {language.is_active ? (
                        <Badge variant="default" className="bg-green-500">Yes</Badge>
                      ) : (
                        <Badge variant="destructive">No</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={() => setLanguagePage((prev) => Math.max(prev - 1, 1))}
                disabled={languagePage === 1}
              >
                Previous
              </Button>
              <span>Page {languagePage} of {totalLanguagePages}</span>
              <Button
                variant="outline"
                onClick={() => setLanguagePage((prev) => Math.min(prev + 1, totalLanguagePages))}
                disabled={languagePage === totalLanguagePages}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}