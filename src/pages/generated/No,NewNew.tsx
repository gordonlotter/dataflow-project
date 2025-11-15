function No,NewNew() {
  interface Player {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
  }

  // 1. Define ALL TypeScript interfaces HERE (inside function)
  // 2. React hooks
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { toast } = useToast();

  // 3. Effects and handlers
  useEffect(() => {
    fetchPlayers();
  }, [currentPage]); // Re-fetch players when currentPage changes

  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, first_name, last_name, email, created_at')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1); // Pagination
      
      if (error) {
        throw error;
      }
      setPlayers(data || []);
    } catch (err: any) {
      console.error("Error fetching players:", err);
      setError(err.message || 'Failed to fetch players.');
      toast({
        title: "Error",
        description: err.message || "Failed to load player data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  }

  const filteredPlayers = useMemo(() => {
    if (!searchTerm) {
      return players;
    }
    return players.filter(player =>
      player.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [players, searchTerm]);

  function handleNextPage() {
    setCurrentPage(prev => prev + 1);
  }

  function handlePreviousPage() {
    setCurrentPage(prev => prev - 1);
  }

  // 4. Return JSX with Tailwind semantic tokens
  return (
    <div className="container mx-auto p-6 bg-background text-foreground min-h-screen">
      <Card className="bg-card text-card-foreground shadow-lg">
        <CardHeader className="flex justify-between items-center border-b border-border pb-4">
          <CardTitle className="text-2xl font-bold">New Player Management</CardTitle>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-64"
            />
            <Button>
              <Link to="/player/new" className="flex items-center">
                <Plus className="mr-2 h-4 w-4" /> New Player
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading && (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading players...</p>
            </div>
          )}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!loading && !error && filteredPlayers.length === 0 && searchTerm && (
            <div className="text-center py-8 text-muted-foreground">
              No players found matching "{searchTerm}".
            </div>
          )}
          {!loading && !error && filteredPlayers.length === 0 && !searchTerm && (
            <div className="text-center py-8 text-muted-foreground">
              No players available. Create a new player to get started!
            </div>
          )}
          {!loading && !error && filteredPlayers.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player) => (
                  <TableRow key={player.id} className="hover:bg-accent">
                    <TableCell className="font-medium">{player.id.substring(0, 8)}...</TableCell>
                    <TableCell>{player.first_name}</TableCell>
                    <TableCell>{player.last_name}</TableCell>
                    <TableCell>{player.email}</TableCell>
                    <TableCell>{new Date(player.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link to={`/player/${player.id}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast({ title: "View Player", description: `Viewing player ${player.first_name}` })}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => toast({ title: "Delete Player", description: `Deleting player ${player.first_name}`, variant: "destructive" })}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {!loading && !error && (
          <CardFooter className="flex justify-between items-center border-t border-border pt-4">
            <Button
              variant="outline"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="text-primary hover:bg-primary/10"
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground mr-2">Page {currentPage}</span>
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={filteredPlayers.length < itemsPerPage} // Disable if fewer items than expected
              className="text-primary hover:bg-primary/10"
            >
              Next
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

render(<No,NewNew />);