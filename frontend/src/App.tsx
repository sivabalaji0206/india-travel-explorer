import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { catalogueApi } from './api/catalogueApi';
import {
  Place,
  PlaceCategory,
  SavedPlanDetail,
  Season,
  State,
} from './api/types';
import { AuthModal } from './components/auth/AuthModal';
import { HeroBanner } from './components/home/HeroBanner';
import { Footer } from './components/layout/Footer';
import { Navbar } from './components/layout/Navbar';
import { PlaceDetailModal } from './components/places/PlaceDetailModal';
import { PlaceExplorer } from './components/places/PlaceExplorer';
import { PlannerModal } from './components/planner/PlannerModal';
import { SavedPlansView } from './components/plans/SavedPlansView';
import { StateGrid } from './components/states/StateGrid';

export const App: React.FC = () => {
  // Navigation
  const [activeSection, setActiveSection] = useState<'states' | 'places' | 'plans'>('states');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [plannerModalOpen, setPlannerModalOpen] = useState<boolean>(false);
  const [plannerInitialStateId, setPlannerInitialStateId] = useState<number | null>(null);
  const [detailPlaceId, setDetailPlaceId] = useState<number | null>(null);

  // States Data
  const [states, setStates] = useState<State[]>([]);
  const [statesLoading, setStatesLoading] = useState<boolean>(true);

  // Places Data & Filters
  const [places, setPlaces] = useState<Place[]>([]);
  const [placesLoading, setPlacesLoading] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [selectedStateId, setSelectedStateId] = useState<number | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | ''>('');
  const [selectedBudget, setSelectedBudget] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<Season | ''>('');
  const [search, setSearch] = useState<string>('');
  const [hiddenGemOnly, setHiddenGemOnly] = useState<boolean>(false);

  // Fetch States on initial load
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setStatesLoading(true);
        const data = await catalogueApi.getStates();
        setStates(data);
      } catch (err) {
        console.error('Failed to fetch states', err);
      } finally {
        setStatesLoading(false);
      }
    };
    fetchStates();
  }, []);

  // Fetch Places whenever filters change
  useEffect(() => {
    const fetchPlaces = async () => {
      setPlacesLoading(true);
      try {
        const response = await catalogueApi.getPlaces({
          state_id: selectedStateId === '' ? undefined : selectedStateId,
          category: selectedCategory === '' ? undefined : selectedCategory,
          budget_level: selectedBudget === '' ? undefined : selectedBudget,
          best_season: selectedSeason === '' ? undefined : selectedSeason,
          search: search.trim() || undefined,
          is_hidden_gem: hiddenGemOnly ? true : undefined,
          page: currentPage,
          page_size: 16,
        });
        setPlaces(response.items);
        setTotalItems(response.meta.total_items);
        setTotalPages(response.meta.total_pages);
      } catch (err) {
        console.error('Failed to fetch attractions', err);
      } finally {
        setPlacesLoading(false);
      }
    };

    fetchPlaces();
  }, [
    selectedStateId,
    selectedCategory,
    selectedBudget,
    selectedSeason,
    search,
    hiddenGemOnly,
    currentPage,
  ]);

  // Handlers
  const handleOpenPlanner = (stateId?: number) => {
    setPlannerInitialStateId(stateId || null);
    setPlannerModalOpen(true);
  };

  const handleHeroSearch = (query: string) => {
    setSearch(query);
    setCurrentPage(1);
    if (activeSection !== 'places') {
      setActiveSection('places');
    }
  };

  const handleHeroCategorySelect = (category: PlaceCategory) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setActiveSection('places');
  };

  const handleExploreState = (stateId: number) => {
    setSelectedStateId(stateId);
    setCurrentPage(1);
    setActiveSection('places');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSelectedStateId('');
    setSelectedCategory('');
    setSelectedBudget('');
    setSelectedSeason('');
    setSearch('');
    setHiddenGemOnly(false);
    setCurrentPage(1);
  };

  const handleViewPlanDetail = (_planDetail: SavedPlanDetail) => {
    // Open planner directly with the plan's state
    setPlannerInitialStateId(_planDetail.state_id);
    setPlannerModalOpen(true);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Global Navigation Bar */}
      <Navbar
        activeSection={activeSection}
        onNavigate={(section) => setActiveSection(section)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenPlanner={handleOpenPlanner}
      />

      {/* Hero Banner (Shown on States & Attractions tabs) */}
      {activeSection !== 'plans' && (
        <HeroBanner
          onSearch={handleHeroSearch}
          onSelectCategory={handleHeroCategorySelect}
          onOpenPlanner={() => handleOpenPlanner()}
        />
      )}

      {/* Main Content Area based on Active Tab */}
      <Box sx={{ flexGrow: 1 }}>
        {activeSection === 'states' && (
          <StateGrid
            states={states}
            loading={statesLoading}
            onExploreState={handleExploreState}
            onPlanTripForState={(stateId) => handleOpenPlanner(stateId)}
          />
        )}

        {activeSection === 'places' && (
          <PlaceExplorer
            states={states}
            places={places}
            loading={placesLoading}
            totalItems={totalItems}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={(p) => setCurrentPage(p)}
            selectedStateId={selectedStateId}
            onSelectState={(id) => {
              setSelectedStateId(id);
              setCurrentPage(1);
            }}
            selectedCategory={selectedCategory}
            onSelectCategory={(c) => {
              setSelectedCategory(c);
              setCurrentPage(1);
            }}
            selectedBudget={selectedBudget}
            onSelectBudget={(b) => {
              setSelectedBudget(b);
              setCurrentPage(1);
            }}
            selectedSeason={selectedSeason}
            onSelectSeason={(s) => {
              setSelectedSeason(s);
              setCurrentPage(1);
            }}
            search={search}
            onSearchChange={(q) => {
              setSearch(q);
              setCurrentPage(1);
            }}
            hiddenGemOnly={hiddenGemOnly}
            onToggleHiddenGem={(checked) => {
              setHiddenGemOnly(checked);
              setCurrentPage(1);
            }}
            onResetFilters={handleResetFilters}
            onViewDetails={(placeId) => setDetailPlaceId(placeId)}
          />
        )}

        {activeSection === 'plans' && (
          <SavedPlansView
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenPlanner={handleOpenPlanner}
            onViewPlanDetail={handleViewPlanDetail}
          />
        )}
      </Box>

      {/* Global Modals */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <PlaceDetailModal
        placeId={detailPlaceId}
        open={Boolean(detailPlaceId)}
        onClose={() => setDetailPlaceId(null)}
        onPlanTrip={(stateId) => handleOpenPlanner(stateId)}
      />

      <PlannerModal
        open={plannerModalOpen}
        onClose={() => setPlannerModalOpen(false)}
        initialStateId={plannerInitialStateId}
        states={states}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Global Footer */}
      <Footer />
    </Box>
  );
};

export default App;
