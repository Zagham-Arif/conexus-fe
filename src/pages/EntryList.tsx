import { Calendar, Edit, Film, Plus, Search, Star, Trash2, Tv } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useEntry } from '../contexts/EntryContext';
import { useDebounce } from '../hooks/useDebounce';

const EntryList: React.FC = () => {
  const { entries, loading, pagination, fetchEntries, deleteEntry } = useEntry();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay

  // Fetch entries when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 20,
      search: debouncedSearchTerm,
      type: filterType || undefined,
      sortBy,
      sortOrder,
    };

    fetchEntries(params);
  }, [debouncedSearchTerm, filterType, sortBy, sortOrder, currentPage]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterType, sortBy, sortOrder]);

  const handleDelete = async (id: string) => {
    try {
      await deleteEntry(id);
      // Refresh the current page after deletion
      const params = {
        page: currentPage,
        limit: 20,
        search: debouncedSearchTerm,
        type: filterType || undefined,
        sortBy,
        sortOrder,
      };
      fetchEntries(params);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getTypeIcon = (type: string) => {
    return type === 'movie' ? <Film className="h-4 w-4" /> : <Tv className="h-4 w-4" />;
  };

  const getTypeColor = (type: string) => {
    return type === 'movie' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  if (loading && entries.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Collection</h1>
          <p className="text-muted-foreground">
            Manage your favorite movies and TV shows
          </p>
        </div>
        <Link to="/entries/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </Link>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, director, or genre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="">All Types</option>
            <option value="movie">Movies</option>
            <option value="tv-show">TV Shows</option>
          </select>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="year-desc">Year (Newest)</option>
            <option value="year-asc">Year (Oldest)</option>
            <option value="rating-desc">Rating (Highest)</option>
            <option value="rating-asc">Rating (Lowest)</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      {pagination && (
        <div className="text-sm text-muted-foreground">
          Showing {((pagination.page - 1) * 20) + 1} to {Math.min(pagination.page * 20, pagination.total)} of {pagination.total} entries
        </div>
      )}

      {/* Entries Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <Card key={entry.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getTypeIcon(entry.type)}
                  <Badge className={getTypeColor(entry.type)}>
                    {entry.type === 'movie' ? 'Movie' : 'TV Show'}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Link to={`/entries/${entry.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete "{entry.title}" from your collection.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(entry.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <CardTitle className="text-lg">{entry.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{entry.year}</span>
                  <span>•</span>
                  <span>{entry.duration} min</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Director:</span> {entry.director}
                </div>
                {entry.genre && (
                  <div className="text-sm">
                    <span className="font-medium">Genre:</span> {entry.genre}
                  </div>
                )}
                {entry.rating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{entry.rating}/10</span>
                  </div>
                )}
                {entry.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {entry.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {entries.length === 0 && !loading && (
        <div className="text-center py-12">
          <Film className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No entries found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterType 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first movie or TV show'
            }
          </p>
          <Link to="/entries/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </Link>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>
          
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === pagination.totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && entries.length > 0 && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <LoadingSpinner />
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryList;