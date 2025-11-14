'''
function LocalizationPage() {
  const [currencies, setCurrencies] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [currenciesRes, languagesRes] = await Promise.all([
          supabase.from('currencies').select('id,code,name,symbol,is_active'),
          supabase.from('languages').select('id,code,name,native_name,is_active')
        ]);

        if (currenciesRes.error) throw currenciesRes.error;
        if (languagesRes.error) throw languagesRes.error;

        setCurrencies(currenciesRes.data || []);
        setLanguages(languagesRes.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCurrencies = currencies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLanguages = languages.filter(l =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 bg-red-100 p-4 rounded-md">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white tracking-tight">Localization Explorer</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          A centralized view of currencies and languages.
        </p>
      </header>

      <div className="mb-6">
        <div className="relative max-w-md">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
           <Input
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg border-gray-200/50 dark:border-gray-800/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-xl font-semibold">
              <DollarSign className="mr-3 h-6 w-6 text-green-500" /> Currencies
            </CardTitle>
            <Badge variant="outline">{filteredCurrencies.length} found</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCurrencies.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-gray-500 dark:text-gray-400">{c.code}</TableCell>
                    <TableCell className="font-mono">{c.symbol}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={c.is_active ? 'default' : 'secondary'}
                        className={c.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}
                      >
                        {c.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-gray-200/50 dark:border-gray-800/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-xl font-semibold">
              <Globe className="mr-3 h-6 w-6 text-blue-500" /> Languages
            </CardTitle>
             <Badge variant="outline">{filteredLanguages.length} found</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Native Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLanguages.map(l => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell className="text-gray-500 dark:text-gray-400">{l.native_name}</TableCell>
                    <TableCell className="font-mono">{l.code}</TableCell>
                    <TableCell className="text-right">
                       <Badge variant={l.is_active ? 'default' : 'secondary'}
                        className={l.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}
                      >
                        {l.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

       <Card className="mt-8 shadow-lg border-gray-200/50 dark:border-gray-800/50">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-semibold">
            <Link className="mr-3 h-6 w-6 text-purple-500" /> Schema Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
                The <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded-sm text-sm">tenants</code> table, which represents your customers or accounts, has columns to set a default currency and language.
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2">
                <li>
                    <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded-sm text-sm">tenants.currency_code</code> has a many-to-one relationship with <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded-sm text-sm">currencies.code</code>.
                </li>
                <li>
                    <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded-sm text-sm">tenants.language_code</code> has a many-to-one relationship with <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded-sm text-sm">languages.code</code>.
                </li>
            </ul>
             <p className="mt-4 text-gray-600 dark:text-gray-300">
                This allows each tenant to have their own localization settings for displaying data.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}

render(<LocalizationPage />);
'''