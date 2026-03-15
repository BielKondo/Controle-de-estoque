import { createContext, useContext, useState } from 'react';

export type Locale = 'en' | 'pt';

const translations = {
  en: {
    // Nav / Layout
    menu: 'Menu',
    dashboard: 'Dashboard',
    scan: 'Scan',
    stock: 'Stock Management',
    addProduct: 'Add Product',
    settings: 'Settings',
    inventoryOverview: 'Inventory Overview',
    scanCode: 'Scan Code',

    // Dashboard
    totalProducts: 'Total Products',
    lowStock: 'Low Stock',
    critical: 'Critical',
    recentMovements: 'Recent Movements',
    viewAll: 'View All',
    stockAdded: 'Stock Added',
    stockRemoved: 'Stock Removed',
    units: 'units',
    noMovements: 'No movements yet. Start by scanning a product.',
    weeklyReport: 'Weekly Report Ready',
    weeklyReportDesc: 'Analyze your stock performance for this week.',
    generatePdf: 'Generate PDF',

    // Stock page
    productDetails: 'Product Details',
    currentStock: 'Current Stock',
    quantityToAdd: 'Quantity to Add',
    quantityToRemove: 'Quantity to Remove',
    confirmEntry: 'Confirm Entry',
    confirmOutput: 'Confirm Output',
    insufficientStock: (n: number) => `Insufficient stock. Available: ${n} units.`,
    productNotFound: 'Product not found',
    productNotFoundDesc: (code: string) => `No product with SKU or barcode "${code}"`,
    scanAgain: 'Scan Again',
    loadingProduct: 'Loading product...',
    noProductSelected: 'No product selected. Use Scan to find a product.',
    goToScan: 'Go to Scan',

    // Scan
    step: (n: number, t: number) => `Step ${n} of ${t}`,
    scanTitle: 'Scan product barcode or QR code',
    manualTitle: 'Enter product code manually',
    scanDesc: 'Align the code within the frame to scan automatically',
    manualDesc: 'Type the code below to proceed',
    enterCode: 'Enter Barcode or QR Code',
    continue: 'Continue',

    // Settings
    appSettings: 'App Settings',
    system: 'System',
    darkMode: 'Dark Mode',
    notifications: 'Notifications',
    enabled: 'Enabled',
    dataSync: 'Data Synchronization',
    connectedSupabase: 'Connected to Supabase',
    deviceMgmt: 'Device Management',
    privacyPolicy: 'Privacy Policy',
    signOut: 'Sign Out',
    language: 'Language',

    // Add Product
    newProduct: 'New Product',
    newProductDesc: 'Fill in the details to register a product',
    productName: 'Product Name',
    productNamePlaceholder: 'e.g. MacBook Pro M3',
    skuLabel: 'SKU',
    barcodeLabel: 'Barcode',
    optional: 'optional',
    price: 'Price',
    category: 'Category',
    selectCategory: '— Select a category —',
    initialStock: 'Initial Stock',
    minStock: 'Min. Stock',
    minStockNote: 'alert',
    description: 'Description',
    descriptionPlaceholder: 'Additional details about the product...',
    registerProduct: 'Register Product',
    productRegistered: 'Product registered!',
    redirecting: 'Redirecting to dashboard...',
    skuInUse: 'This SKU is already in use. Please use a different one.',
    barcodeInUse: 'This barcode is already linked to another product.',

    // Company
    company: 'Companies',
    companyProfile: 'Company Profile',
    companyProfileDesc: 'Information about your company',
    companyName: 'Company Name',
    document: 'CNPJ / Document',
    phone: 'Phone',
    address: 'Address',
    city: 'City',
    state: 'State',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    savedSuccess: 'Saved successfully!',
    newCompany: 'New Company',
    editCompany: 'Edit Company',
    deleteCompany: 'Delete Company',
    confirmDeleteCompany: 'Are you sure you want to delete this company?',
    noCompanies: 'No companies registered.',
    noCompaniesDesc: 'Click "New Company" to add one.',
    companies: 'Companies',

    // User Management
    userManagement: 'User Management',
    inviteUser: 'Invite User',
    inviteEmail: 'Employee email',
    inviteName: 'Full name',
    sendInvite: 'Send Invite',
    sending: 'Sending...',
    inviteSent: 'Invite sent successfully!',
    deleteUser: 'Delete user',
    confirmDelete: 'Are you sure you want to remove this user?',
    permStockIn: 'Stock In',
    permStockOut: 'Stock Out',
    adminBadge: 'Admin',
    noUsers: 'No users found.',
    youLabel: 'You',
    permissions: 'Permissions',
    noPermission: 'You do not have permission for this action.',

    // Products list
    products: 'Products',
    searchProducts: 'Search by name or SKU...',
    allCategories: 'All Categories',
    allStatus: 'All',
    inStock: 'In Stock',
    lowStockFilter: 'Low Stock',
    noProducts: 'No products found.',
    noProductsDesc: 'Try a different search or add a new product.',
    addFirst: 'Add your first product',
    stockLabel: 'Stock',

    // Login
    welcomeBack: 'Welcome Back',
    loginDesc: 'Enter your credentials to access your warehouse',
    companyId: 'Company ID',
    workEmail: 'Work Email',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    rememberDevice: 'Remember this device',
    signIn: 'Sign In to Dashboard',
    signingIn: 'Signing in...',
    newPlatform: 'New to the platform?',
    contactSupport: 'Contact Support',

    // Accept Invite
    acceptInviteTitle: 'Set up your account',
    acceptInviteDesc: 'Define your password to access the system',
    yourCompanyId: 'Your Company ID',
    yourCompanyIdNote: 'Use this ID on the login screen',
    newPassword: 'New Password',
    confirmPasswordLabel: 'Confirm Password',
    passwordMismatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 6 characters',
    saveAndEnter: 'Save and Sign In',
    invalidInvite: 'Invalid or expired invite link.',
    companyIdForInvite: 'Company ID (shown to user in email)',
  },
  pt: {
    // Nav / Layout
    menu: 'Menu',
    dashboard: 'Dashboard',
    scan: 'Escanear',
    stock: 'Gestão de Estoque',
    addProduct: 'Adicionar Produto',
    settings: 'Configurações',
    inventoryOverview: 'Visão Geral do Estoque',
    scanCode: 'Escanear Código',

    // Dashboard
    totalProducts: 'Total de Produtos',
    lowStock: 'Estoque Baixo',
    critical: 'Crítico',
    recentMovements: 'Movimentações Recentes',
    viewAll: 'Ver Tudo',
    stockAdded: 'Entrada de Estoque',
    stockRemoved: 'Saída de Estoque',
    units: 'unidades',
    noMovements: 'Nenhuma movimentação ainda. Comece escaneando um produto.',
    weeklyReport: 'Relatório Semanal Pronto',
    weeklyReportDesc: 'Analise o desempenho do seu estoque nesta semana.',
    generatePdf: 'Gerar PDF',

    // Stock page
    productDetails: 'Detalhes do Produto',
    currentStock: 'Estoque Atual',
    quantityToAdd: 'Quantidade a Adicionar',
    quantityToRemove: 'Quantidade a Remover',
    confirmEntry: 'Confirmar Entrada',
    confirmOutput: 'Confirmar Saída',
    insufficientStock: (n: number) => `Estoque insuficiente. Disponível: ${n} unidades.`,
    productNotFound: 'Produto não encontrado',
    productNotFoundDesc: (code: string) => `Nenhum produto com SKU ou código "${code}"`,
    scanAgain: 'Escanear Novamente',
    loadingProduct: 'Carregando produto...',
    noProductSelected: 'Nenhum produto selecionado. Use o Scan para encontrar um produto.',
    goToScan: 'Ir para Scan',

    // Scan
    step: (n: number, t: number) => `Passo ${n} de ${t}`,
    scanTitle: 'Escaneie o código de barras ou QR code do produto',
    manualTitle: 'Digite o código do produto manualmente',
    scanDesc: 'Alinhe o código dentro do quadro para escanear automaticamente',
    manualDesc: 'Digite o código abaixo para continuar',
    enterCode: 'Digite o Código de Barras ou QR Code',
    continue: 'Continuar',

    // Settings
    appSettings: 'Configurações do App',
    system: 'Sistema',
    darkMode: 'Modo Escuro',
    notifications: 'Notificações',
    enabled: 'Ativado',
    dataSync: 'Sincronização de Dados',
    connectedSupabase: 'Conectado ao Supabase',
    deviceMgmt: 'Gerenciamento de Dispositivos',
    privacyPolicy: 'Política de Privacidade',
    signOut: 'Sair',
    language: 'Idioma',

    // Add Product
    newProduct: 'Novo Produto',
    newProductDesc: 'Preencha os detalhes para cadastrar um produto',
    productName: 'Nome do Produto',
    productNamePlaceholder: 'ex: MacBook Pro M3',
    skuLabel: 'SKU',
    barcodeLabel: 'Código de Barras',
    optional: 'opcional',
    price: 'Preço',
    category: 'Categoria',
    selectCategory: '— Selecione uma categoria —',
    initialStock: 'Estoque Inicial',
    minStock: 'Estoque Mín.',
    minStockNote: 'alerta',
    description: 'Descrição',
    descriptionPlaceholder: 'Detalhes adicionais sobre o produto...',
    registerProduct: 'Cadastrar Produto',
    productRegistered: 'Produto cadastrado!',
    redirecting: 'Redirecionando para o dashboard...',
    skuInUse: 'Este SKU já está em uso. Por favor, use um diferente.',
    barcodeInUse: 'Este código de barras já está vinculado a outro produto.',

    // Company
    company: 'Empresas',
    companyProfile: 'Perfil da Empresa',
    companyProfileDesc: 'Informações sobre a sua empresa',
    companyName: 'Nome da Empresa',
    document: 'CNPJ / Documento',
    phone: 'Telefone',
    address: 'Endereço',
    city: 'Cidade',
    state: 'Estado',
    saveChanges: 'Salvar Alterações',
    saving: 'Salvando...',
    savedSuccess: 'Salvo com sucesso!',
    newCompany: 'Nova Empresa',
    editCompany: 'Editar Empresa',
    deleteCompany: 'Excluir Empresa',
    confirmDeleteCompany: 'Tem certeza que deseja excluir esta empresa?',
    noCompanies: 'Nenhuma empresa cadastrada.',
    noCompaniesDesc: 'Clique em "Nova Empresa" para adicionar.',
    companies: 'Empresas',

    // User Management
    userManagement: 'Gestão de Usuários',
    inviteUser: 'Convidar Usuário',
    inviteEmail: 'E-mail do funcionário',
    inviteName: 'Nome completo',
    sendInvite: 'Enviar Convite',
    sending: 'Enviando...',
    inviteSent: 'Convite enviado com sucesso!',
    deleteUser: 'Remover usuário',
    confirmDelete: 'Tem certeza que deseja remover este usuário?',
    permStockIn: 'Entrada de Estoque',
    permStockOut: 'Saída de Estoque',
    adminBadge: 'Admin',
    noUsers: 'Nenhum usuário encontrado.',
    youLabel: 'Você',
    permissions: 'Permissões',
    noPermission: 'Você não tem permissão para esta ação.',

    // Products list
    products: 'Produtos',
    searchProducts: 'Buscar por nome ou SKU...',
    allCategories: 'Todas as Categorias',
    allStatus: 'Todos',
    inStock: 'Em Estoque',
    lowStockFilter: 'Estoque Baixo',
    noProducts: 'Nenhum produto encontrado.',
    noProductsDesc: 'Tente uma busca diferente ou adicione um produto.',
    addFirst: 'Adicione seu primeiro produto',
    stockLabel: 'Estoque',

    // Login
    welcomeBack: 'Bem-vindo de Volta',
    loginDesc: 'Insira suas credenciais para acessar o armazém',
    companyId: 'ID da Empresa',
    workEmail: 'E-mail Corporativo',
    password: 'Senha',
    forgotPassword: 'Esqueceu a senha?',
    rememberDevice: 'Lembrar este dispositivo',
    signIn: 'Entrar no Dashboard',
    signingIn: 'Entrando...',
    newPlatform: 'Novo na plataforma?',
    contactSupport: 'Contatar Suporte',

    // Accept Invite
    acceptInviteTitle: 'Configure sua conta',
    acceptInviteDesc: 'Defina sua senha para acessar o sistema',
    yourCompanyId: 'ID da sua Empresa',
    yourCompanyIdNote: 'Use este ID na tela de login',
    newPassword: 'Nova Senha',
    confirmPasswordLabel: 'Confirmar Senha',
    passwordMismatch: 'As senhas não coincidem',
    passwordTooShort: 'A senha deve ter pelo menos 6 caracteres',
    saveAndEnter: 'Salvar e Entrar',
    invalidInvite: 'Link de convite inválido ou expirado.',
    companyIdForInvite: 'ID da Empresa (será informado ao usuário)',
  },
};

export type Translations = typeof translations.en;

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue>(null!);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(
    () => (localStorage.getItem('locale') as Locale) || 'pt'
  );

  const setLocale = (l: Locale) => {
    localStorage.setItem('locale', l);
    setLocaleState(l);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  return useContext(I18nContext);
}
