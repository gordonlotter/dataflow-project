function SerchFieldsFilters() {
  interface Currency {
    id: number;
    code: string;
    name: string;
  }
  interface Language {
    id: number;
    code: string;
    name: string;
  }
  interface LinkedData {
    currency: Currency;
    languages: Language[];
  }

  const [currencies, setCurrencies] = React.useState<Currency[]>([]);
  const [languages, setLanguages] = React.useState<Language[]>([]);
  const [linkedData, setLinkedData] = React.useState<LinkedData[]>([]);
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [selectedCurrency, setSelectedCurrency] = React.useState<string>("");

  const { supabase } = useSupabase(); // Assuming useSupabase hook is available

  React.useEffect(() => {
    loadCurrenciesAndLanguages();
  }, []);

  React.useEffect(() => {
    if (currencies.length > 0 && languages.length > 0) {
      createLinkedData();
    }
  }, [currencies, languages]);

  const loadCurrenciesAndLanguages = async () => {
    const { data: connections } = await supabase
      .from('database_connections')
      .select('id')
      .eq('is_active', true)
      .single();

    if (!connections) {
      console.error("No active database connection found.");
      return;
    }

    // Load Currencies
    const { data: currencyResult } = await supabase.functions.invoke('db-query', {
      body: {
        connectionId: connections.id,
        query: 'SELECT id, code, name FROM currencies'
      }
    });
    setCurrencies(currencyResult || []);

    // Load Languages
    const { data: languageResult } = await supabase.functions.invoke('db-query', {
      body: {
        connectionId: connections.id,
        query: 'SELECT id, code, name FROM languages'
      }
    });
    setLanguages(languageResult || []);
  };

  const createLinkedData = () => {
    // This is a placeholder for linking logic.
    // In a real scenario, you'd likely have a linking table or a more complex way to associate them.
    // For this example, we'll just assign languages to currencies in a round-robin fashion.
    const newLinkedData: LinkedData[] = currencies.map((currency, index) => ({
      currency: currency,
      languages: [languages[index % languages.length]].filter(Boolean), // Ensure language exists
    }));
    setLinkedData(newLinkedData);
  };

  const filteredLinkedData = React.useMemo(() => {
    let data = linkedData;

    if (searchTerm) {
      data = data.filter(
        (item) =>
          item.currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.languages.some((lang) =>
            lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lang.code.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (selectedCurrency) {
      data = data.filter((item) => item.currency.code === selectedCurrency);
    }

    return data;
  }, [linkedData, searchTerm, selectedCurrency]);

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
              placeholder="Search by currency or language..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow bg-card text-card-foreground border-border"
            />
            <Select
              onValueChange={setSelectedCurrency}
              value={selectedCurrency}
            >
              <SelectTrigger className="w-[180px] bg-card text-card-foreground border-border">
                <SelectValue placeholder="Filter by Currency" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                <SelectItem value="">All Currencies</SelectItem>
                {currencies.map((currency) => (
                  <SelectItem key={currency.id} value={currency.code}>
                    {currency.name} ({currency.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => { setSearchTerm(""); setSelectedCurrency(""); }} className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
              Reset Filters
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader className="bg-muted text-muted-foreground">
                <TableRow>
                  <TableHead className="w-1/3 p-4 text-left">Currency Code</TableHead>
                  <TableHead className="w-1/3 p-4 text-left">Currency Name</TableHead>
                  <TableHead className="w-1/3 p-4 text-left">Linked Languages</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinkedData.length > 0 ? (
                  filteredLinkedData.map((item, index) => (
                    <TableRow key={index} className="odd:bg-card even:bg-card-foreground/[0.02]">
                      <TableCell className="p-4">{item.currency.code}</TableCell>
                      <TableCell className="p-4">{item.currency.name}</TableCell>
                      <TableCell className="p-4">
                        {item.languages.length > 0
                          ? item.languages.map((lang) => `${lang.name} (${lang.code})`).join(", ")
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground p-4">
                      No matching data found.
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

render(<SerchFieldsFilters />);