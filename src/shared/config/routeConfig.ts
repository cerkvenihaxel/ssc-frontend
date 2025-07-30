import type { Route } from '../../domain/entities/User';

// Configuración de rutas disponibles para cada rol
export const ROUTE_CONFIG: Record<string, Route[]> = {
  Administrador: [
    {
      path: '/admin/dashboard',
      title: 'Dashboard',
      icon: 'Home',
      order: 1
    },
    {
      path: '/admin/users',
      title: 'Gestión de Usuarios',
      icon: 'Users',
      order: 2,
      children: [
        {
          path: '/admin/users',
          title: 'Todos los Usuarios',
          icon: 'Users',
          order: 1
        },
        {
          path: '/admin/users/create',
          title: 'Crear Usuario',
          icon: 'UserPlus',
          order: 2
        },
        {
          path: '/admin/users/stats',
          title: 'Estadísticas',
          icon: 'PieChart',
          order: 3
        },
        {
          path: '/admin/users/providers',
          title: 'Proveedores',
          icon: 'Building2',
          order: 4
        },
        {
          path: '/admin/users/auditors',
          title: 'Auditores',
          icon: 'ShieldCheck',
          order: 5
        },
        {
          path: '/admin/users/effectors',
          title: 'Efectores',
          icon: 'Building',
          order: 6
        }
      ]
    },
    {
      path: '/admin/requests',
      title: 'Solicitudes',
      icon: 'FileText',
      order: 3
    },
    {
      path: '/admin/medical-orders',
      title: 'Órdenes Médicas',
      icon: 'FileText',
      order: 4
    },
    {
      path: '/admin/effector-requests',
      title: 'Solicitudes de Efectores',
      icon: 'Building',
      order: 5
    },
    {
      path: '/auditor/dashboard',
      title: 'Auditoría',
      icon: 'ShieldCheck',
      order: 6,
      children: [
        {
          path: '/auditor/dashboard',
          title: 'Dashboard de Auditoría',
          icon: 'ShieldCheck',
          order: 1
        },
        {
          path: '/auditor/pending-requests',
          title: 'Solicitudes Pendientes',
          icon: 'Clock',
          order: 2
        },
        {
          path: '/auditor/audited-requests',
          title: 'Historial de Auditorías',
          icon: 'History',
          order: 3
        },
        {
          path: '/auditor/statistics',
          title: 'Estadísticas',
          icon: 'BarChart3',
          order: 4
        }
      ]
    },
    {
      path: '/auditor-services',
      title: 'Servicios Auditores',
      icon: 'ShieldCheck',
      order: 7,
      children: [
        {
          path: '/auditor-services/pending-quotations',
          title: 'Ver cotizaciones para auditar',
          icon: 'FileSearch',
          order: 1
        },
        {
          path: '/auditor-services/audited-requests',
          title: 'Solicitudes auditadas',
          icon: 'CheckCircle',
          order: 2
        },
        {
          path: '/auditor-services/completed-requests',
          title: 'Solicitudes finalizadas',
          icon: 'Archive',
          order: 3
        }
      ]
    },
    {
      path: '/material-delivery',
      title: 'Entregas de Materiales',
      icon: 'Package',
      order: 8,
      children: [
        {
          path: '/material-delivery',
          title: 'Lista de Entregas',
          icon: 'Package',
          order: 1
        },
        {
          path: '/material-delivery/create',
          title: 'Nueva Entrega',
          icon: 'Plus',
          order: 2
        }
      ]
    },
    {
      path: '/admin/deposito',
      title: 'Depósito',
      icon: 'Warehouse',
      order: 9,
      children: [
        {
          path: '/admin/deposito/articulos',
          title: 'Artículos',
          icon: 'Package',
          order: 1
        },
        {
          path: '/admin/deposito/grupos',
          title: 'Grupos',
          icon: 'FolderOpen',
          order: 2
        }
      ]
    },
    {
      path: '/admin/analytics',
      title: 'Analytics',
      icon: 'BarChart3',
      order: 10
    },
    {
      path: '/admin/activities',
      title: 'Actividades',
      icon: 'Activity',
      order: 11
    },
    {
      path: '/admin/settings',
      title: 'Configuración',
      icon: 'Settings',
      order: 12
    }
  ],
  Auditor: [
    {
      path: '/auditor/dashboard',
      title: 'Dashboard de Auditoría',
      icon: 'ShieldCheck',
      order: 1
    },
    {
      path: '/auditor/pending-requests',
      title: 'Solicitudes Pendientes',
      icon: 'Clock',
      order: 2
    },
    {
      path: '/auditor/audited-requests',
      title: 'Historial de Auditorías',
      icon: 'History',
      order: 3
    },
    {
      path: '/auditor/statistics',
      title: 'Estadísticas',
      icon: 'BarChart3',
      order: 4
    },
    {
      path: '/auditor-services',
      title: 'Servicios Auditores',
      icon: 'ShieldCheck',
      order: 5,
      children: [
        {
          path: '/auditor-services/pending-quotations',
          title: 'Ver cotizaciones para auditar',
          icon: 'FileSearch',
          order: 1
        },
        {
          path: '/auditor-services/audited-requests',
          title: 'Solicitudes auditadas',
          icon: 'CheckCircle',
          order: 2
        },
        {
          path: '/auditor-services/completed-requests',
          title: 'Solicitudes finalizadas',
          icon: 'Archive',
          order: 3
        }
      ]
    },
    {
      path: '/material-delivery',
      title: 'Entregas de Materiales',
      icon: 'Package',
      order: 6,
      children: [
        {
          path: '/material-delivery',
          title: 'Lista de Entregas',
          icon: 'Package',
          order: 1
        }
      ]
    }
  ],
  Proveedor: [
    {
      path: '/provider-services',
      title: 'Servicios de Proveedor',
      icon: 'Briefcase',
      order: 1
    },
    {
      path: '/material-delivery',
      title: 'Entregas de Materiales',
      icon: 'Package',
      order: 2,
      children: [
        {
          path: '/material-delivery',
          title: 'Lista de Entregas',
          icon: 'Package',
          order: 1
        },
        {
          path: '/material-delivery/create',
          title: 'Nueva Entrega',
          icon: 'Plus',
          order: 2
        }
      ]
    }
  ],
  Efector: [
    {
      path: '/efector/requests',
      title: 'Mis Solicitudes',
      icon: 'FileText',
      order: 1
    },
    {
      path: '/efector/requests/create',
      title: 'Nueva Solicitud',
      icon: 'Plus',
      order: 2
    }
  ],
  Médico: [
    {
      path: '/medico/solicitudes',
      title: 'Mis Solicitudes',
      icon: 'FileText',
      order: 1
    }
  ],
  Afiliado: [
    {
      path: '/afiliado/profile',
      title: 'Mi Perfil',
      icon: 'User',
      order: 1
    }
  ]
};

// Función para obtener las rutas disponibles para un rol específico
export const getAvailableRoutesForRole = (roleName: string): Route[] => {
  return ROUTE_CONFIG[roleName] || [];
};

// Función para ordenar las rutas por el campo order
export const sortRoutesByOrder = (routes: Route[]): Route[] => {
  const sortRoutes = (routeList: Route[]): Route[] => {
    return routeList
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(route => ({
        ...route,
        children: route.children ? sortRoutes(route.children) : undefined
      }));
  };
  
  return sortRoutes(routes);
}; 