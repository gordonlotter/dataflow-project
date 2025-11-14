function LocalizationSettingsPage() {
  const [currencies, setCurrencies] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currencySearch, setCurrencySearch] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [currenciesRes, languagesRes, tenantsRes] = await Promise.all([
          supabase.from('currencies').select('*'),
          supabase.from('languages').select('*'),
          supabase.from('tenants').select('name, currency_code, language_code')
        ]);

        if (currenciesRes.error) throw currenciesRes.error;
        if (languagesRes.error) throw languagesRes.error;
        if (tenantsRes.error) throw tenantsRes.error;

        setCurrencies(currenciesRes.data || []);
        setLanguages(languagesRes.data || []);
        setTenants(tenantsRes.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCurrencies = currencies.filter(c =>
    c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const filteredLanguages = languages.filter(l =>
    l.name.toLowerCase().includes(languageSearch.toLowerCase()) ||
    l.code.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const getCurrencyName = (code) => currencies.find(c => c.code === code)?.name || code;
  const getLanguageName = (code) => languages.find(l => l.code === code)?.name || code;

  if (loading) {
    return <div className="flex items-center justify-center h-full"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Localization Settings</CardTitle>
          <CardDescription>
            Manage currencies and languages and their connections to tenants.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Currencies</CardTitle>
            <Input
              placeholder="Search currencies..."
              value={currencySearch}
              onChange={(e) => setCurrencySearch(e.target.value)}
              className="mt-2"
            />
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
                {filteredCurrencies.map(currency => (
                  <TableRow key={currency.id}>
                    <TableCell>{currency.code}</TableCell>
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
             <Input
              placeholder="Search languages..."
              value={languageSearch}
              onChange={(e) => setLanguageSearch(e.target.value)}
              className="mt-2"
            />
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
                {filteredLanguages.map(lang => (
                  <TableRow key={lang.id}>
                    <TableCell>{lang.code}</TableCell>
                    <TableCell>{lang.name}</TableCell>
                    <TableCell>{lang.native_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenant Connections</CardTitle>
          <CardDescription>
            Tenants using specific languages and currencies.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Currency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map(tenant => (
                  <TableRow key={tenant.name}>
                    <TableCell>{tenant.name}</TableCell>
                    <TableCell>{getLanguageName(tenant.language_code)}</TableCell>
                    <TableCell>{getCurrencyName(tenant.currency_code)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}

render(<LocalizationSettingsPage />);