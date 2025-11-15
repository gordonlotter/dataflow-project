function Localization() {
  interface Currency {
    id: string;
    code: string;
    name: string;
    symbol: string;
    decimal_places: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }
  interface Language {
    id: string;
    code: string;
    name: string;
    native_name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySearch, setCurrencySearch] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: currencyResult, error: currencyError } = await supabase.functions.invoke('db-query', {
        body: {
          connectionId: '308f1f01-282b-40bc-b2c2-d1c8228a8d62',
          query: 'SELECT * FROM currencies ORDER BY name ASC'
        }
      });

      if (currencyError) throw currencyError;
      setCurrencies(currencyResult?.data || []);

      const { data: languageResult, error: languageError } = await supabase.functions.invoke('db-query', {
        body: {
          connectionId: '308f1f01-282b-40bc-b2c2-d1c8228a8d62',
          query: 'SELECT * FROM languages ORDER BY name ASC'
        }
      });

      if (languageError) throw languageError;
      setLanguages(languageResult?.data || []);

    } catch (err: any) {
      toast({
        title: "Error loading data",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCurrencies = currencies.filter(currency =>
    currency.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
    currency.code.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const filteredLanguages = languages.filter(language =>
    language.name.toLowerCase().includes(languageSearch.toLowerCase()) ||
    language.native_name.toLowerCase().includes(languageSearch.toLowerCase()) ||
    language.code.toLowerCase().includes(languageSearch.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="container mx-auto p-6 bg-background">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">Localization Settings</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Currencies</CardTitle>
            <CardDescription>Manage your supported currencies.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search currencies..."
              value={currencySearch}
              onChange={(e) => setCurrencySearch(e.target.value)}
              className="mb-4"
            />
            <div className="max-h-[400px] overflow-y-auto pr-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-center">Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCurrencies.length > 0 ? (
                    filteredCurrencies.map((currency) => (
                      <TableRow key={currency.id}>
                        <TableCell className="font-medium">{currency.code}</TableCell>
                        <TableCell>{currency.name}</TableCell>
                        <TableCell>{currency.symbol}</TableCell>
                        <TableCell className="text-center">
                          {currency.is_active ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-red-500 mx-auto" />}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No currencies found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Languages</CardTitle>
            <CardDescription>Manage your supported languages.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search languages..."
              value={languageSearch}
              onChange={(e) => setLanguageSearch(e.target.value)}
              className="mb-4"
            />
            <div className="max-h-[400px] overflow-y-auto pr-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Native Name</TableHead>
                    <TableHead className="text-center">Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLanguages.length > 0 ? (
                    filteredLanguages.map((language) => (
                      <TableRow key={language.id}>
                        <TableCell className="font-medium">{language.code}</TableCell>
                        <TableCell>{language.name}</TableCell>
                        <TableCell>{language.native_name}</TableCell>
                        <TableCell className="text-center">
                          {language.is_active ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-red-500 mx-auto" />}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No languages found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

render(<Localization />);