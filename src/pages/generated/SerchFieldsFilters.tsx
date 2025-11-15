Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


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
}
  interface LinkedData {
  language: Language;
  currency: Currency[];
}

  const [languages, setLanguages] = useState<Language[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [linkedData, setLinkedData] = useState<LinkedData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchTerm, selectedLanguage, languages, currencies]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: langsData, error: langsError } = await supabase
        .from('languages')
        .select('id, name, code');

      if (langsError) throw langsError;
      setLanguages(langsData || []);

      const { data: currsData, error: currsError } = await supabase
        .from('currencies')
        .select('id, name, code, symbol');

      if (currsError) throw currsError;
      setCurrencies(currsData || []);

    } catch (err: any) {
      console.error('Error fetching data:', err.message);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    const results: LinkedData[] = languages
      .filter(lang =>
        lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lang.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(lang => !selectedLanguage || lang.id === selectedLanguage)
      .map(lang => {
        // This is a placeholder for actual linking logic.
        // In a real application, you'd likely have a linking table or
        // a more complex way to associate languages with currencies.
        // For now, we'll associate some currencies arbitrarily or based on a simple rule.
        const associatedCurrencies = currencies.filter(curr => {
            // Example: Link currencies with codes partially matching language code
            // This is just for demonstration. Real linking would be based on business logic.
            return lang.code.includes(curr.code.substring(0,2).toLowerCase()) ||
                   curr.code.toLowerCase().includes(lang.code.substring(0,2).toLowerCase());
        });
        return { language: lang, currency: associatedCurrencies.length > 0 ? associatedCurrencies : [currencies[0]] || [] }; // Default to first currency if no link
      });

    setLinkedData(results);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-background text-foreground shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Currencies and Languages</CardTitle>
            <CardDescription>Loading data...</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Loading languages and currencies...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-background text-foreground shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Currencies and Languages</CardTitle>
            <CardDescription className="text-red-500">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchData} className="bg-primary text-primary-foreground">Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-background text-foreground">
      <Card className="shadow-lg">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-3xl font-extrabold tracking-tight">Currencies and Languages</CardTitle>
          <CardDescription className="pt-2 text-muted-foreground">
            Explore the relationship between languages and their associated currencies. Use the search and filter options to refine your view.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              type="text"
              placeholder="Search by language name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-primary-foreground"
            />
            <Select onValueChange={setSelectedLanguage} value={selectedLanguage}>
              <SelectTrigger className="w-[200px] bg-card text-card-foreground border-input">
                <SelectValue placeholder="Filter by Language" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                <SelectItem value="">All Languages</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.name} ({lang.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => { setSearchTerm(''); setSelectedLanguage(''); }} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Clear Filters
            </Button>
          </div>

          <p className="mb-4 text-sm text-muted-foreground">
            {linkedData.length} result(s) found.
          </p>

          <div className="overflow-x-auto rounded-lg border border-border">
            <Table className="w-full text-left">
              <TableHeader className="bg-muted text-muted-foreground">
                <TableRow>
                  <TableHead className="px-6 py-3 font-semibold text-sm uppercase tracking-wider">Language Name</TableHead>
                  <TableHead className="px-6 py-3 font-semibold text-sm uppercase tracking-wider">Language Code</TableHead>
                  <TableHead className="px-6 py-3 font-semibold text-sm uppercase tracking-wider">Associated Currencies</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-card divide-y divide-border">
                {linkedData.map((item) => (
                  <TableRow key={item.language.id} className="hover:bg-accent/50 transition-colors duration-200">
                    <TableCell className="px-6 py-4 whitespace-nowrap font-medium text-card-foreground">
                      {item.language.name}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {item.language.code}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {item.currency.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {item.currency.map((curr) => (
                            <span
                              key={curr.id}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground shadow-sm"
                            >
                              {curr.name} ({curr.code}) {curr.symbol}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">No specific currency linked</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {linkedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      No languages or linked currencies found with the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}