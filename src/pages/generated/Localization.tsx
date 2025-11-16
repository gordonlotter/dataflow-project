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
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActiveCurrencies, setFilterActiveCurrencies] = useState('all');
  const [filterActiveLanguages, setFilterActiveLanguages] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadCurrencies();
    loadLanguages();
  }, []);

  const loadCurrencies = async () => {
    setLoadingCurrencies(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('db-query', {
        body: {
          connectionId: '308f1f01-282b-40bc-b2c2-d1c8228a8d62',
          query: 'SELECT * FROM currencies ORDER BY name ASC'
        }
      });

      if (error) throw error;
      setCurrencies(result?.data || []);
    } catch (err: any) {
      toast({
        title: "Error loading currencies",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoadingCurrencies(false);
    }
  };

  const loadLanguages = async () => {
    setLoadingLanguages(true);
    try {
        const { data: result, error } = await supabase.functions.invoke('db-query', {
        body: {
            connectionId: '308f1f01-282b-40bc-b2c2-d1c8228a8d62', // Assuming same connection an a 'languages' table exists
            query: 'SELECT * FROM languages ORDER BY name ASC'
        }
        });

        if (error) throw error;
        setLanguages(result?.data || []);
    } catch (err: any) {
        toast({
            title: "Error loading languages",
            description: err.message,
            variant: "destructive"
        });
    } finally {
        setLoadingLanguages(false);
    }
  };

  const filteredCurrencies = currencies.filter(currency => {
    const matchesSearch = currency.name.toLowerCase().includes(searchTerm.toLowerCase()) || currency.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterActiveCurrencies === 'all' || (filterActiveCurrencies === 'active' && currency.is_active) || (filterActiveCurrencies === 'inactive' && !currency.is_active);
    return matchesSearch && matchesFilter;
  });

  const filteredLanguages = languages.filter(language => {
      const matchesSearch = language.name.toLowerCase().includes(searchTerm.toLowerCase()) || language.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterActiveLanguages === 'all' || (filterActiveLanguages === 'active' && language.is_active) || (filterActiveLanguages === 'inactive' && !language.is_active);
      return matchesSearch && matchesFilter;
  })

  return (
    <Tabs defaultValue="currencies" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="currencies">Currencies</TabsTrigger>
        <TabsTrigger value="languages">Languages</TabsTrigger>
      </TabsList>
      <TabsContent value="currencies">
        <Card>
          <CardHeader>
            <CardTitle>Currencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Input
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={filterActiveCurrencies} onValueChange={setFilterActiveCurrencies}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {loadingCurrencies ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCurrencies.map((currency) => (
                    <TableRow key={currency.id}>
                      <TableCell>{currency.name}</TableCell>
                      <TableCell>{currency.code}</TableCell>
                      <TableCell>{currency.symbol}</TableCell>
                      <TableCell>{currency.is_active ? 'Active' : 'Inactive'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="languages">
         <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Input
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={filterActiveLanguages} onValueChange={setFilterActiveLanguages}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {loadingLanguages ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                     <TableHead>Native Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLanguages.map((lang) => (
                    <TableRow key={lang.id}>
                      <TableCell>{lang.name}</TableCell>
                      <TableCell>{lang.native_name}</TableCell>
                      <TableCell>{lang.code}</TableCell>
                      <TableCell>{lang.is_active ? 'Active' : 'Inactive'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

render(<Localization />);