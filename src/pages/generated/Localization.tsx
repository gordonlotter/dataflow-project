function Localization() {
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

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: currencyResult, error: currencyError } = await supabase.functions.invoke('db-query', {
        body: {
          connectionId: '308f1f01-282b-40bc-b2c2-d1c8222a8d62',
          query: 'SELECT * FROM currencies ORDER BY name ASC'
        }
      });

      if (currencyError) throw currencyError;
      setCurrencies(currencyResult?.data || []);

      const { data: languageResult, error: languageError } = await supabase.functions.invoke('db-query', {
        body: {
          connectionId: '308f1f01-282b-40bc-b2c2-d1c8222a8d62',
          query: 'SELECT * FROM languages ORDER BY name ASC'
        }
      });

      if (languageError) throw languageError;
      setLanguages(languageResult?.data || []);

    } catch (err: any) {
      console.error("Error loading localization data:", err);
      setError(err.message || "An unknown error occurred");
      toast({
        title: "Error loading data",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <p className="ml-2 text-lg">Loading localization data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center p-8 text-destructive">
        <X className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-semibold">Error</h2>
        <p className="text-lg text-center">Failed to load data: {error}</p>
        <Button onClick={loadData} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 bg-background">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Localization Settings</CardTitle>
          <CardDescription>Manage currencies and languages available in the system.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-semibold mb-4">Currencies ({currencies.length})</h3>
            <div className="max-h-[400px] overflow-y-auto border rounded-md">
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
                  {currencies.map((currency) => (
                    <TableRow key={currency.id}>
                      <TableCell className="font-medium">{currency.code}</TableCell>
                      <TableCell>{currency.name}</TableCell>
                      <TableCell>{currency.symbol}</TableCell>
                      <TableCell className="text-center">
                        {currency.is_active ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-500 mx-auto" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-4">Languages ({languages.length})</h3>
            <div className="max-h-[400px] overflow-y-auto border rounded-md">
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
                  {languages.map((language) => (
                    <TableRow key={language.id}>
                      <TableCell className="font-medium">{language.code}</TableCell>
                      <TableCell>{language.name}</TableCell>
                      <TableCell>{language.native_name}</TableCell>
                      <TableCell className="text-center">
                        {language.is_active ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-500 mx-auto" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Connection between Currencies and Languages</CardTitle>
          <CardDescription>While there isn't a direct relational link between currencies and languages in the provided schema, they often relate through regional settings for users and tenants.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">In a typical application, users or tenants would have a preferred language and a preferred currency, linking these two concepts indirectly. For example, a `tenants` table might have `currency_code` and `language_code` columns.</p>
          <p className="mt-2 text-muted-foreground">To see how tenants are configured with currencies and languages, you would typically join `tenants` with `currencies` on `tenants.currency_code = currencies.code` and with `languages` on `tenants.language_code = languages.code`.</p>
        </CardContent>
      </Card>
    </div>
  );
}

render(<Localization />);