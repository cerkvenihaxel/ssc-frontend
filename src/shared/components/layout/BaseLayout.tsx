import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { 
  Menu, 
  X, 
  LogOut, 
  User, 
  Home, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Shield, 
  Building, 
  Stethoscope, 
  Heart,
  ChevronDown,
  ChevronRight,
  // Admin icons
  Database,
  UserPlus,
  UserCheck,
  UserCog,
  Building2,
  ShieldCheck,
  FileCheck,
  Clock,
  CheckCircle,
  TrendingUp,
  PieChart,
  Activity,
  Cog,
  // Auditor icons
  Search,
  FileSearch,
  ClipboardCheck,
  History,
  FileBarChart,
  // Efector icons
  Plus,
  Package,
  ShoppingCart,
  Truck,
  UserCircle,
  // Proveedor icons
  Calculator,
  Briefcase,
  Archive,
  Store,
  // Médico icons
  Clipboard,
  Users2,
  // Afiliado icons
  CreditCard,
  // Depósito icons
  Warehouse,
  // General icons
  FolderOpen,
  List,
  Eye,
  Edit
} from 'lucide-react';
import { useAuth } from '../../../presentation/contexts/AuthContext';
import type { Route } from '../../../domain/entities/User';
import Button from '../ui/Button';
import { Link, useLocation } from 'react-router-dom';


interface BaseLayoutProps {
  children: ReactNode;
  title?: string;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const toggleMenuExpansion = (path: string) => {
    setExpandedMenus(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const getRouteIcon = (path: string, iconName?: string) => {
    // Comprehensive icon mapping for all routes
    const iconMap: Record<string, React.ReactElement> = {
      // === ADMIN ROUTES ===
      '/admin/dashboard': <Home className="w-5 h-5" />,
      '/admin/users': <Users className="w-5 h-5" />,
      '/admin/users/create': <UserPlus className="w-5 h-5" />,
      '/admin/users/stats': <PieChart className="w-5 h-5" />,
      '/admin/users/providers': <Building2 className="w-5 h-5" />,
      '/admin/users/providers/create': <Plus className="w-4 h-4" />,
      '/admin/users/auditors': <ShieldCheck className="w-5 h-5" />,
      '/admin/users/auditors/create': <UserPlus className="w-4 h-4" />,
      '/admin/users/effectors': <Building className="w-5 h-5" />,
      '/admin/users/effectors/create': <Plus className="w-4 h-4" />,
      '/admin/requests': <FileText className="w-5 h-5" />,
      '/admin/requests/all': <FolderOpen className="w-4 h-4" />,
      '/admin/requests/pending': <Clock className="w-4 h-4" />,
      '/admin/requests/approved': <CheckCircle className="w-4 h-4" />,
      '/admin/analytics': <BarChart3 className="w-5 h-5" />,
      '/admin/settings': <Settings className="w-5 h-5" />,

      // === DEPÓSITO ROUTES ===
      '/admin/deposito': <Warehouse className="w-5 h-5" />,
      '/admin/deposito/articulos': <Package className="w-5 h-5" />,
      '/admin/deposito/grupos': <FolderOpen className="w-5 h-5" />,

      // === ADMIN EFFECTOR REQUEST ROUTES ===
      '/admin/effector-requests': <Building className="w-5 h-5" />,
      '/admin/effector-requests/list': <List className="w-4 h-4" />,
      '/admin/effector-requests/create': <Plus className="w-4 h-4" />,
      '/admin/effector-requests/pending': <Clock className="w-4 h-4" />,
      '/admin/effector-requests/ai-review': <Activity className="w-4 h-4" />,
      
      // === ADMIN MEDICAL ORDER ROUTES ===
      '/admin/medical-orders': <FileText className="w-5 h-5" />,
      '/admin/medical-orders/create': <Plus className="w-4 h-4" />,
      '/admin/medical-orders/ai-review': <Activity className="w-4 h-4" />,

      // === AUDITOR ROUTES ===
      '/auditor/dashboard': <ShieldCheck className="w-5 h-5" />,
      '/auditor/pending-requests': <Clock className="w-5 h-5" />,
      '/auditor/audited-requests': <History className="w-5 h-5" />,
      '/auditor/statistics': <BarChart3 className="w-5 h-5" />,
      '/auditor/requests': <ClipboardCheck className="w-5 h-5" />,
      '/auditor/requests/pending': <Clock className="w-5 h-5" />,
      '/auditor/requests/history': <History className="w-5 h-5" />,
      '/auditor/reports': <FileBarChart className="w-5 h-5" />,

      // === AUDITOR SERVICES ROUTES ===
      '/auditor-services': <ShieldCheck className="w-5 h-5" />,
      '/auditor-services/pending-quotations': <FileSearch className="w-5 h-5" />,
      '/auditor-services/audited-requests': <CheckCircle className="w-5 h-5" />,
      '/auditor-services/completed-requests': <Archive className="w-5 h-5" />,

      // === EFECTOR ROUTES ===
      '/efector/requests': <FileText className="w-5 h-5" />,
      '/efector/requests/create': <Plus className="w-5 h-5" />,
      '/efector/requests/pending': <Clock className="w-5 h-5" />,
      '/efector/quotations': <Calculator className="w-5 h-5" />,
      '/efector/orders': <ShoppingCart className="w-5 h-5" />,
      '/efector/profile': <Building className="w-5 h-5" />,

      // === PROVEEDOR ROUTES ===
      '/proveedor/quotations': <Calculator className="w-5 h-5" />,
      '/proveedor/requests': <FileSearch className="w-5 h-5" />,
      '/proveedor/orders': <Package className="w-5 h-5" />,
      '/proveedor/catalog': <Archive className="w-5 h-5" />,
      '/proveedor/profile': <Store className="w-5 h-5" />,

      // === MATERIAL DELIVERY ROUTES ===
      '/material-delivery': <Package className="w-5 h-5" />,
      '/material-delivery/create': <Plus className="w-4 h-4" />,

      // === PROVIDER SERVICES ROUTES ===
      '/provider-services': <Briefcase className="w-5 h-5" />,
      '/admin/provider-services': <Briefcase className="w-5 h-5" />,
      '/provider-services/available-requests': <Search className="w-5 h-5" />,
      '/provider-services/my-quotations': <Calculator className="w-5 h-5" />,
      '/provider-services/audited-quotations': <CheckCircle className="w-5 h-5" />,

      // === MÉDICO ROUTES ===
      '/medico/solicitudes': <Stethoscope className="w-5 h-5" />,
      '/medico/solicitudes/create': <Clipboard className="w-5 h-5" />,
      '/medico/pacientes': <Users2 className="w-5 h-5" />,
      '/medico/profile': <UserCircle className="w-5 h-5" />,

      // === AFILIADO ROUTES ===
      '/afiliado/profile': <UserCircle className="w-5 h-5" />,
      '/afiliado/solicitudes': <FileText className="w-5 h-5" />,
      '/afiliado/obras-sociales': <Heart className="w-5 h-5" />,

      // === SPECIFIC DETAIL/EDIT ROUTES ===
      // Admin user management
      '/admin/users/list': <List className="w-4 h-4" />,
      '/admin/users/providers/list': <List className="w-4 h-4" />,
      '/admin/users/auditors/list': <List className="w-4 h-4" />,
      '/admin/users/effectors/list': <List className="w-4 h-4" />,

      // Generic fallback patterns
      // Detail pages
      'details': <Eye className="w-4 h-4" />,
      'edit': <Edit className="w-4 h-4" />,
      'create': <Plus className="w-4 h-4" />,
      'list': <List className="w-4 h-4" />,
      'pending': <Clock className="w-4 h-4" />,
      'approved': <CheckCircle className="w-4 h-4" />,
      'history': <History className="w-4 h-4" />,
      'stats': <Activity className="w-4 h-4" />
    };

    // Try exact match first
    if (iconMap[path]) {
      return iconMap[path];
    }

    // Try pattern matching for dynamic routes like /admin/users/:id
    const pathSegments = path.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    // Check if last segment matches common patterns
    if (iconMap[lastSegment]) {
      return iconMap[lastSegment];
    }

    // Check parent path patterns
    if (path.includes('/admin/users/providers')) {
      return <Building2 className="w-4 h-4" />;
    }
    if (path.includes('/admin/users/auditors')) {
      return <ShieldCheck className="w-4 h-4" />;
    }
    if (path.includes('/admin/users/effectors')) {
      return <Building className="w-4 h-4" />;
    }
    if (path.includes('/admin/users')) {
      return <Users className="w-4 h-4" />;
    }
    if (path.includes('/admin/effector-requests')) {
      return <Building className="w-4 h-4" />;
    }
    if (path.includes('/admin/medical-orders')) {
      return <FileText className="w-4 h-4" />;
    }
    if (path.includes('/admin/requests')) {
      return <FileText className="w-4 h-4" />;
    }
    if (path.includes('/admin/deposito')) {
      return <Warehouse className="w-4 h-4" />;
    }
    if (path.includes('/auditor')) {
      return <ClipboardCheck className="w-4 h-4" />;
    }
    if (path.includes('/efector')) {
      return <Building className="w-4 h-4" />;
    }
    if (path.includes('/proveedor')) {
      return <Store className="w-4 h-4" />;
    }
    if (path.includes('/medico')) {
      return <Stethoscope className="w-4 h-4" />;
    }
    if (path.includes('/afiliado')) {
      return <UserCircle className="w-4 h-4" />;
    }

    // Default fallback
    return <FileText className="w-4 h-4" />;
  };

  const isActiveRoute = (routePath: string): boolean => {
    const currentPath = location.pathname;
    
    // Exact match for the route
    if (currentPath === routePath) {
      return true;
    }
    
    // For parent routes with children, only mark as active if we're exactly on that route
    // or if none of the children routes match more specifically
    if (currentPath.startsWith(routePath + '/')) {
      // Get all available routes to check if there's a more specific match
      const allRoutes = getAllRoutes(user?.availableRoutes || []);
      
      // Find if there's a more specific route that matches the current path
      const moreSpecificRoute = allRoutes.find(route => 
        route.path !== routePath && 
        route.path.startsWith(routePath) && 
        (currentPath === route.path || currentPath.startsWith(route.path + '/'))
      );
      
      // Only return true if no more specific route was found
      return !moreSpecificRoute;
    }
    
    return false;
  };

  // Helper function to get all routes recursively
  const getAllRoutes = (routes: Route[]): Route[] => {
    const allRoutes: Route[] = [];
    
    const extractRoutes = (routeList: Route[]) => {
      routeList.forEach(route => {
        allRoutes.push(route);
        if (route.children) {
          extractRoutes(route.children);
        }
      });
    };
    
    extractRoutes(routes);
    return allRoutes;
  };

  const renderMenuItem = (route: Route, level = 0) => {
    const paddingLeft = level * 16 + 16;
    const hasChildren = route.children && route.children.length > 0;
    const isExpanded = expandedMenus.includes(route.path);
    const isActive = isActiveRoute(route.path);
    
    return (
      <div key={route.path} className="relative">
        <div className="relative">
          {hasChildren ? (
            <button
              onClick={() => toggleMenuExpansion(route.path)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ease-out group ${
                isActive
                  ? 'bg-primary text-white shadow-lg transform scale-[0.99]'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-darkmode-700 hover:shadow-sm hover:scale-[0.99]'
              }`}
              style={{ paddingLeft: `${paddingLeft}px` }}
            >
              <div className="flex items-center transition-transform duration-200 ease-out group-hover:translate-x-1">
                <div className="transition-transform duration-200 ease-out group-hover:scale-110">
                  {getRouteIcon(route.path, route.icon)}
                </div>
                <span className="ml-3">{route.title}</span>
              </div>
              <div className={`transition-all duration-300 ease-out ${isExpanded ? 'rotate-180' : 'rotate-0'} group-hover:scale-110`}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>
          ) : (
            <Link
              to={route.path}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ease-out group ${
                isActive
                  ? 'bg-primary text-white shadow-lg transform scale-[0.99]'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-darkmode-700 hover:shadow-sm hover:scale-[0.99]'
              }`}
              style={{ paddingLeft: `${paddingLeft}px` }}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="flex items-center transition-transform duration-200 ease-out group-hover:translate-x-1">
                <div className="transition-transform duration-200 ease-out group-hover:scale-110">
                  {getRouteIcon(route.path, route.icon)}
                </div>
                <span className="ml-3">{route.title}</span>
              </div>
            </Link>
          )}
          
          {/* Active indicator with smooth transition */}
          <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 bg-primary rounded-r-full transition-all duration-300 ease-out ${
            isActive ? 'h-8 opacity-100' : 'h-0 opacity-0'
          }`} />
        </div>
        
        {/* Render children with smooth slide animation */}
        <div className={`overflow-hidden transition-all duration-300 ease-out ${
          hasChildren && isExpanded 
            ? 'max-h-96 opacity-100 mt-1 mb-2' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="space-y-1">
            {hasChildren && route.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        </div>
      </div>
    );
  };

  const getRoleBadgeColor = (roleName: string) => {
    const colors = {
      'Administrador': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
      'Auditor': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
      'Efector': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
      'Proveedor': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
      'Médico': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200',
      'Afiliado': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
    };
    return colors[roleName as keyof typeof colors] || colors.Afiliado;
  };

  const getRoleIcon = (roleName: string) => {
    const roleIcons = {
      'Administrador': <Database className="w-4 h-4" />,
      'Auditor': <ShieldCheck className="w-4 h-4" />,
      'Efector': <Building className="w-4 h-4" />,
      'Proveedor': <Store className="w-4 h-4" />,
      'Médico': <Stethoscope className="w-4 h-4" />,
      'Afiliado': <UserCircle className="w-4 h-4" />
    };
    return roleIcons[roleName as keyof typeof roleIcons] || <User className="w-4 h-4" />;
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 bg-gradient-to-r from-primary to-primary/90 shadow-lg">
        <div className="flex items-center group cursor-pointer">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm transition-transform duration-200 ease-out group-hover:scale-110">
            <Heart className="w-5 h-5 text-primary transition-transform duration-200 ease-out group-hover:scale-110" />
          </div>
          <h1 className="ml-3 text-lg font-bold text-white transition-transform duration-200 ease-out group-hover:translate-x-1">
            VadaSoft
          </h1>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="text-white/80 hover:text-white lg:hidden p-1 rounded-md hover:bg-white/10 transition-all duration-200 ease-out hover:scale-110"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 dark:border-darkmode-400 bg-gray-50 dark:bg-darkmode-700">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 rounded-full flex items-center justify-center border-2 border-primary/20 transition-all duration-300 ease-out group-hover:scale-110 group-hover:shadow-md">
            <div className="transition-transform duration-200 ease-out group-hover:scale-110">
              {getRoleIcon(user?.role.name || '')}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate transition-transform duration-200 ease-out group-hover:translate-x-1">
              {user?.nombre}
            </p>
            <div className="flex items-center mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ease-out group-hover:scale-105 ${getRoleBadgeColor(user?.role.name || '')}`}>
                {user?.role.name}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 truncate transition-transform duration-200 ease-out group-hover:translate-x-1">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="px-3 py-4 space-y-1">
          {(() => {
            // Obtener rutas del backend
            const backendRoutes = user?.availableRoutes || [];
            
            // Definir las nuevas rutas para agregar
            const newRoutes = [
              {
                path: '/auditor-services',
                title: 'Servicios Auditores',
                icon: 'ShieldCheck',
                children: [
                  {
                    path: '/auditor-services/pending-quotations',
                    title: 'Ver cotizaciones para auditar',
                    icon: 'FileSearch'
                  },
                  {
                    path: '/auditor-services/audited-requests',
                    title: 'Solicitudes auditadas',
                    icon: 'CheckCircle'
                  },
                  {
                    path: '/auditor-services/completed-requests',
                    title: 'Solicitudes finalizadas',
                    icon: 'Archive'
                  }
                ]
              },
              {
                path: '/material-delivery',
                title: 'Material Entregado',
                icon: 'Package',
                children: [
                  {
                    path: '/material-delivery',
                    title: 'Lista de Entregas',
                    icon: 'Package'
                  },
                  {
                    path: '/material-delivery/create',
                    title: 'Nueva Entrega',
                    icon: 'Plus'
                  }
                ]
              }
            ];
            
            // Combinar rutas del backend con las nuevas rutas
            // Insertar las nuevas rutas después de "Servicios Proveedores"
            const allRoutes = [...backendRoutes];
            
            // Buscar el índice de "Servicios Proveedores" para insertar después
            const providerServicesIndex = allRoutes.findIndex(route => 
              route.path === '/provider-services' || 
              route.title === 'Servicios Proveedores'
            );
            
            if (providerServicesIndex !== -1) {
              // Insertar después de Servicios Proveedores
              allRoutes.splice(providerServicesIndex + 1, 0, ...newRoutes);
            } else {
              // Si no se encuentra, agregar al final
              allRoutes.push(...newRoutes);
            }
            
            return allRoutes.map(route => renderMenuItem(route));
          })()}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-darkmode-400 bg-gray-50 dark:bg-darkmode-700">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-800 transition-all duration-300 ease-out hover:scale-105 hover:shadow-sm group"
        >
          <LogOut className="h-4 w-4 mr-2 transition-transform duration-200 ease-out group-hover:scale-110" />
          <span className="transition-transform duration-200 ease-out group-hover:translate-x-0.5">
            Cerrar Sesión
          </span>
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkmode-800">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ease-out ${
        sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div 
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`} 
          onClick={() => setSidebarOpen(false)} 
        />
        <div className={`relative flex w-80 flex-col bg-white dark:bg-darkmode-600 shadow-2xl h-full transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {sidebarContent}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col z-40">
        <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-darkmode-600 shadow-xl border-r border-gray-200 dark:border-darkmode-400">
          {sidebarContent}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Top header */}
        <div className="sticky top-0 z-30 bg-white/90 dark:bg-darkmode-600/90 backdrop-blur-md border-b border-gray-200 dark:border-darkmode-400 shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-darkmode-700 transition-all duration-200 ease-out hover:scale-110 group"
              >
                <Menu className="h-6 w-6 transition-transform duration-200 ease-out group-hover:scale-110" />
              </button>
              {title && (
                <div className="ml-4 lg:ml-0">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-opacity duration-400 ease-in">
                    {title}
                  </h2>
                  <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-slate-400">
                    <div className="transition-transform duration-200 ease-out hover:scale-110">
                      {getRoleIcon(user?.role.name || '')}
                    </div>
                    <span className="ml-1">Panel de {user?.role.name}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gray-100 dark:bg-darkmode-700 rounded-lg transition-all duration-200 ease-out hover:shadow-sm hover:scale-105 group cursor-pointer">
                <div className="transition-transform duration-200 ease-out group-hover:scale-110">
                  {getRoleIcon(user?.role.name || '')}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-transform duration-200 ease-out group-hover:translate-x-0.5">
                  {user?.nombre}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1">
          <div 
            key={location.pathname}
            className="p-4 sm:p-6 lg:p-8 animate-fade-in opacity-0"
            style={{
              animation: 'fadeIn 400ms ease-in forwards'
            }}
          >
            {children}
          </div>
        </main>

        {/* CSS Animation Definition */}
        <style>{`
          @keyframes fadeIn {
            to {
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default BaseLayout; 