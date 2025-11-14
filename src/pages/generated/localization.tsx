function LocalizationPage() {
  const [currencies, setCurrencies] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [currenciesRes, languagesRes] = await Promise.all([
          supabase.from('currencies').select('*'),
          supabase.from('languages').select('*'),
        ]);

        if (currenciesRes.error) {
          throw new Error(`Failed to fetch currencies: ${currenciesRes.error.message}`);
        }
        if (languagesRes.error) {
          throw new Error(`Failed to fetch languages: ${languagesRes.error.message}`);
        }

        setCurrencies(currenciesRes.data || []);
        setLanguages(languagesRes.data || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredCurrencies = currencies.filter(currency =>
    currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLanguages = languages.filter(language =>
    language.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    language.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Localization</h1>
        <p className="text-gray-500 mt-1">Manage currencies and languages for your platform.</p>
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

      {loading && (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading data...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Currencies</CardTitle>
              <CardDescription>Available currencies.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Symbol</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCurrencies.map((currency) => (
                    <TableRow key={currency.id}>
                      <TableCell className="font-medium">{currency.code}</TableCell>
                      <TableCell>{currency.name}</TableCell>
                      <TableCell>{currency.symbol}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Languages</CardTitle>
              <CardDescription>Available languages.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Native Name</TableHead>
                  </TableRow>
                TableHeader>
                <TableBody>
                  {filteredLanguages.map((language) => (
                    <TableRow key={language.id}>
                      <TableCell className="font-medium">{language.code}</TableCell>
                      <TableCell>{language.name}</TableCell>
                      <TableCell>{language.native_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

render(<LocalizationPage />);