import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEntry } from '../contexts/EntryContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Save, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const EntryForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentEntry, loading, message, messageType, fetchEntry, createEntry, updateEntry, clearCurrentEntry, clearMessage } = useEntry();

  const isEditing = useMemo(() => !!id, [id]);

  const [formData, setFormData] = useState({
    title: '',
    type: 'movie' as 'movie' | 'tv-show',
    director: '',
    year: new Date().getFullYear(),
    duration: 90,
    genre: '',
    rating: 0,
    description: '',
    posterUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDataLoaded, setHasDataLoaded] = useState(false);

  // Single useEffect to handle all initialization
  useEffect(() => {
    const initializeForm = async () => {
      if (isEditing && id && !hasDataLoaded) {
        console.log('Fetching entry for editing:', id);
        await fetchEntry(id);
        setHasDataLoaded(true);
      } else if (!isEditing) {
        clearCurrentEntry();
        setHasDataLoaded(true);
      }
    };

    initializeForm();

    return () => {
      clearMessage();
    };
  }, [id, isEditing, hasDataLoaded]); // Only include stable values
  console.log('currentEntry', currentEntry);
  // Populate form data when entry is loaded
  useEffect(() => {
    if (currentEntry && isEditing && hasDataLoaded) {
      console.log('Populating form with entry data:', currentEntry);
      setFormData({
        title: currentEntry.title || '',
        type: currentEntry.type || 'movie',
        director: currentEntry.director || '',
        year: currentEntry.year || new Date().getFullYear(),
        duration: currentEntry.duration || 90,
        genre: currentEntry.genre || '',
        rating: currentEntry.rating || 0,
        description: currentEntry.description || '',
        posterUrl: currentEntry.posterUrl || '',
      });
    }
  }, [currentEntry, isEditing, hasDataLoaded]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title is too long (max 255 characters)';
    }

    if (!formData.director.trim()) {
      newErrors.director = 'Director is required';
    } else if (formData.director.length > 255) {
      newErrors.director = 'Director name is too long (max 255 characters)';
    }

    if (formData.year < 1800 || formData.year > new Date().getFullYear() + 10) {
      newErrors.year = 'Please enter a valid year (1800 - ' + (new Date().getFullYear() + 10) + ')';
    }

    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    if (formData.rating < 0 || formData.rating > 10) {
      newErrors.rating = 'Rating must be between 0 and 10';
    }

    if (formData.genre && formData.genre.length > 100) {
      newErrors.genre = 'Genre is too long (max 100 characters)';
    }

    if (formData.posterUrl && !isValidUrl(formData.posterUrl)) {
      newErrors.posterUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = {
        ...formData,
        genre: formData.genre.trim() || undefined,
        description: formData.description.trim() || undefined,
        posterUrl: formData.posterUrl.trim() || undefined,
        rating: formData.rating ? Number(formData.rating) : undefined,
      };

      if (isEditing && id) {
        await updateEntry(id, submissionData);
      } else {
        await createEntry(submissionData);
      }

      navigate('/entries');
    } catch (error: any) {
      console.error('Form submission error:', error);

      if (error.response?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          backendErrors[err.field] = err.message;
        });
        setErrors(backendErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'duration' || name === 'rating' ? Number(value) || 0 : value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (loading && isEditing && !hasDataLoaded) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/entries')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Collection
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? `Edit Entry${currentEntry ? `: ${currentEntry.title}` : ''}` : 'Add New Entry'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update your entry details' : 'Add a new movie or TV show to your collection'}
          </p>
        </div>
      </div>

      {/* Display backend messages */}
      {message && (
        <div className={`p-4 rounded-md ${messageType === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Entry Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter title"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${errors.type ? 'border-red-500' : ''}`}
                >
                  <option value="movie">Movie</option>
                  <option value="tv-show">TV Show</option>
                </select>
                {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="director">Director *</Label>
                <Input
                  id="director"
                  name="director"
                  value={formData.director}
                  onChange={handleChange}
                  placeholder="Enter director name"
                  className={errors.director ? 'border-red-500' : ''}
                />
                {errors.director && <p className="text-sm text-red-500">{errors.director}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="Enter year"
                  className={errors.year ? 'border-red-500' : ''}
                />
                {errors.year && <p className="text-sm text-red-500">{errors.year}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="Enter duration in minutes"
                  className={errors.duration ? 'border-red-500' : ''}
                />
                {errors.duration && <p className="text-sm text-red-500">{errors.duration}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  placeholder="Enter genre"
                  className={errors.genre ? 'border-red-500' : ''}
                />
                {errors.genre && <p className="text-sm text-red-500">{errors.genre}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Rating (0-10)</Label>
                <Input
                  id="rating"
                  name="rating"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.rating}
                  onChange={handleChange}
                  placeholder="Enter rating"
                  className={errors.rating ? 'border-red-500' : ''}
                />
                {errors.rating && <p className="text-sm text-red-500">{errors.rating}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="posterUrl">Poster URL</Label>
                <Input
                  id="posterUrl"
                  name="posterUrl"
                  value={formData.posterUrl}
                  onChange={handleChange}
                  placeholder="Enter poster URL"
                  className={errors.posterUrl ? 'border-red-500' : ''}
                />
                {errors.posterUrl && <p className="text-sm text-red-500">{errors.posterUrl}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting || loading}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">{isEditing ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? 'Update Entry' : 'Create Entry'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/entries')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EntryForm;
