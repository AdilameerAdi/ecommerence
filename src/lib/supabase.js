import { createClient } from '@supabase/supabase-js'

// Use environment variables if available, otherwise use defaults
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tubctzzjpxvjubwonseg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1YmN0enpqcHh2anVid29uc2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzAwMTksImV4cCI6MjA3NDc0NjAxOX0.MsIVqXhs5sVpjIVaRgyIac9lONg0yUDEdH3qw-qTBBQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database helper functions

export const getProducts = async (page = 1, itemsPerPage = 12, filters = {}) => {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories(name),
        brands(name),
        product_images(*)
      `, { count: 'exact' })
      .eq('is_active', true)

    // Apply category filter
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId)
    }

    // Apply brand filters (multiple brands)
    if (filters.brandIds && filters.brandIds.length > 0) {
      query = query.in('brand_id', filters.brandIds)
    }

    // Apply trending filter
    if (filters.isTrending !== null && filters.isTrending !== undefined) {
      query = query.eq('is_trending', filters.isTrending)
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.trim()
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }
    }

    // Apply price range filter
    if (filters.minPrice !== undefined && filters.minPrice !== null) {
      query = query.gte('price', filters.minPrice)
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
      query = query.lte('price', filters.maxPrice)
    }

    // Apply sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'low-high':
          query = query.order('price', { ascending: true })
          break
        case 'high-low':
          query = query.order('price', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }
    } else {
      // Default: newest first (original behavior)
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    const { data, error, count } = await query
      .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)

    if (error) throw error

    return {
      products: data || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / itemsPerPage)
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return {
      products: [],
      totalCount: 0,
      totalPages: 0
    }
  }
}

export const getProductById = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name),
        product_images(*)
      `)
      .eq('id', productId)
      .eq('is_active', true)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

// Brand Management Functions
export const getBrands = async () => {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching brands:', error)
    return []
  }
}

export const addBrand = async (brandData) => {
  try {
    const { data, error } = await supabase
      .from('brands')
      .insert({
        name: brandData.name,
        description: brandData.description || null,
        logo_url: brandData.logo_url || null,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error adding brand:', error)
    return { success: false, error: error.message }
  }
}

export const updateBrand = async (id, brandData) => {
  try {
    const { data, error } = await supabase
      .from('brands')
      .update({
        name: brandData.name,
        description: brandData.description,
        logo_url: brandData.logo_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error updating brand:', error)
    return { success: false, error: error.message }
  }
}

export const deleteBrand = async (id) => {
  try {
    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('brands')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error deleting brand:', error)
    return { success: false, error: error.message }
  }
}

export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export const getTrendingBanner = async () => {
  try {
    const { data, error } = await supabase
      .from('trending_banner')
      .select('*')
      .eq('is_active', true)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching trending banner:', error)
    return null
  }
}

// Admin functions (require authentication)
export const addCategory = async (name) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error adding category:', error)
    return { success: false, error: error.message }
  }
}

export const updateCategory = async (id, name) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error updating category:', error)
    return { success: false, error: error.message }
  }
}

export const deleteCategory = async (id) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { success: false, error: error.message }
  }
}

export const addProduct = async (productData) => {
  try {
    // First, add the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        code: productData.code,
        retail_price: productData.retail_price || null,
        price: productData.price,
        ending_price: productData.ending_price || null,
        description: productData.description,
        category_id: productData.category_id,
        reseller_name: productData.reseller_name,
        brand_id: productData.brand_id || null,
        is_trending: productData.is_trending || false,
        is_active: true
      })
      .select()
      .single()

    if (productError) throw productError

    // Then add images if provided
    if (productData.images && productData.images.length > 0) {
      const imageRecords = productData.images.map((url, index) => ({
        product_id: product.id,
        image_url: url,
        display_order: index + 1,
        is_main: index === 0
      }))

      const { error: imageError } = await supabase
        .from('product_images')
        .insert(imageRecords)

      if (imageError) throw imageError
    }

    return { success: true, data: product }
  } catch (error) {
    console.error('Error adding product:', error)
    return { success: false, error: error.message }
  }
}

export const updateProduct = async (productId, productData) => {
  try {
    // Update product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .update({
        name: productData.name,
        code: productData.code,
        retail_price: productData.retail_price || null,
        price: productData.price,
        ending_price: productData.ending_price || null,
        description: productData.description,
        category_id: productData.category_id,
        reseller_name: productData.reseller_name,
        brand_id: productData.brand_id || null,
        is_trending: productData.is_trending
      })
      .eq('id', productId)
      .select()
      .single()

    if (productError) throw productError

    // Update images if provided
    if (productData.images) {
      // Delete existing images
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId)

      // Add new images
      if (productData.images.length > 0) {
        const imageRecords = productData.images.map((url, index) => ({
          product_id: productId,
          image_url: url,
          display_order: index + 1,
          is_main: index === 0
        }))

        const { error: imageError } = await supabase
          .from('product_images')
          .insert(imageRecords)

        if (imageError) throw imageError
      }
    }

    return { success: true, data: product }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, error: error.message }
  }
}

export const deleteProduct = async (productId) => {
  try {
    // Soft delete (set is_active to false)
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', productId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: error.message }
  }
}

// Sliding Content Management Functions
export const getSlidingContent = async () => {
  try {
    const { data, error } = await supabase
      .from('sliding_content')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
    return data ? data.content : null
  } catch (error) {
    console.error('Error fetching sliding content:', error)
    return null
  }
}

export const updateSlidingContent = async (content) => {
  try {
    // First, deactivate all existing content
    await supabase
      .from('sliding_content')
      .update({ is_active: false })
      .eq('is_active', true)

    // Then insert new content
    const { data, error } = await supabase
      .from('sliding_content')
      .insert({
        content: content,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error updating sliding content:', error)
    return { success: false, error: error.message }
  }
}

export const updateTrendingBanner = async (bannerData) => {
  try {
    // First, deactivate all existing banners
    await supabase
      .from('trending_banner')
      .update({ is_active: false })

    // Then insert or update the new banner
    const { data, error } = await supabase
      .from('trending_banner')
      .upsert({
        title: bannerData.title,
        subtitle: bannerData.subtitle,
        discount_text: bannerData.discount_text,
        button_text: bannerData.button_text,
        banner_image_url: bannerData.banner_image_url,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error updating trending banner:', error)
    return { success: false, error: error.message }
  }
}

export const searchProducts = async (searchTerm, page = 1, itemsPerPage = 6) => {
  try {
    const { data, error, count } = await supabase
      .from('products')
      .select(`
        *,
        categories(name),
        product_images(*)
      `)
      .eq('is_active', true)
      .or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)

    if (error) throw error

    return {
      products: data || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / itemsPerPage)
    }
  } catch (error) {
    console.error('Error searching products:', error)
    return {
      products: [],
      totalCount: 0,
      totalPages: 0
    }
  }
}

export const getDashboardStats = async () => {
  try {
    const { data: stats, error } = await supabase.rpc('get_dashboard_stats')

    if (error) throw error
    return stats
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return null
  }
}

// Admin Authentication Functions
export const validateAdminLogin = async (username, password) => {
  try {
    // Query the admin_users table directly
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, username, password, is_active')
      .eq('username', username)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - user not found
        return { success: false, error: 'Invalid credentials' }
      }
      throw error
    }

    // Check password
    if (data.password === password) {
      // Update last login time
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id)

      // Store admin info in sessionStorage
      const adminUser = {
        id: data.id,
        username: data.username
      }
      sessionStorage.setItem('adminUser', JSON.stringify(adminUser))

      return { success: true, user: adminUser }
    } else {
      return { success: false, error: 'Invalid credentials' }
    }
  } catch (error) {
    console.error('Error validating login:', error)
    return { success: false, error: error.message }
  }
}

export const changeAdminPassword = async (username, oldPassword, newPassword) => {
  try {
    // First verify the old password
    const { data: user, error: authError } = await supabase
      .from('admin_users')
      .select('id, password')
      .eq('username', username)
      .eq('is_active', true)
      .single()

    if (authError || !user) {
      return { success: false, error: 'User not found' }
    }

    if (user.password !== oldPassword) {
      return { success: false, error: 'Current password is incorrect' }
    }

    // Update the password
    const { data, error } = await supabase
      .from('admin_users')
      .update({
        password: newPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error changing password:', error)
    return { success: false, error: error.message }
  }
}

export const updateAdminUsername = async (userId, newUsername) => {
  try {
    // First check if username already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('username', newUsername)
      .neq('id', userId)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      return { success: false, error: 'Error checking username availability' }
    }

    if (existingUser) {
      return { success: false, error: 'Username already exists. Please choose a different username.' }
    }

    // Update the username
    const { data, error } = await supabase
      .from('admin_users')
      .update({
        username: newUsername,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error updating username:', error)
    return { success: false, error: error.message }
  }
}

export const getAdminUser = () => {
  const storedUser = sessionStorage.getItem('adminUser')

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser)
  } catch (error) {
    console.error('Error parsing stored user:', error)
    return null
  }
}

export const logoutAdmin = () => {
  sessionStorage.removeItem('adminUser')
}


// Image upload function
export const uploadProductImage = async (file, productId = null) => {
  try {
    // Create a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = productId ? `products/${productId}/${fileName}` : `products/temp/${fileName}`

    // Upload file to Supabase storage
    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return { success: true, url: publicUrl, path: filePath }
  } catch (error) {
    console.error('Error uploading image:', error)
    return { success: false, error: error.message }
  }
}

// Delete uploaded image
export const deleteProductImage = async (imagePath) => {
  try {
    const { error } = await supabase.storage
      .from('product-images')
      .remove([imagePath])

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error deleting image:', error)
    return { success: false, error: error.message }
  }
}

