import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../../infrastructure/config/supabase";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage } from "react-icons/fi";

// Hàm format tiền tệ
const formatCurrency = (value) => {
    if (!value) return "0₫";
    return Number(value).toLocaleString("vi-VN") + "₫";
};

// Hàm upload ảnh lên Supabase Storage
const uploadImageToSupabase = async (file, productId, colorName) => {
    if (!file) return "";
    const ext = file.name.split(".").pop();
    const fileName = `${productId}_${colorName}_${Date.now()}.${ext}`;
    const filePath = `productcolor/${fileName}`;
    // Upload file lên Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, { upsert: true });
    if (uploadError) {
        alert("Lỗi upload hình: " + uploadError.message);
        return "";
    }
    // Lấy URL công khai của file
    const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);
    const publicUrl = data?.publicUrl || "";
    console.log("publicUrl:", publicUrl);
    return publicUrl;
};

const ProductManagementPage = () => {
    // State sản phẩm
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [showProductModal, setShowProductModal] = useState(false);
    const [modalType, setModalType] = useState("add");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        product_name: "",
        category_id: "",
        description: "",
        base_price: "",
        is_active: true,
    });
    const [reload, setReload] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");

    // State biến thể
    const [variants, setVariants] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [loadingVariants, setLoadingVariants] = useState(false);
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [variantModalType, setVariantModalType] = useState("add");
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [variantForm, setVariantForm] = useState({
        color_name: "",
        color_code: "#000000",
        size_name: "",
        stock_quantity: 0,
        image_url: "",
    });
    const [variantImageFile, setVariantImageFile] = useState(null);
    const [variantImageFiles, setVariantImageFiles] = useState([]);
    const [variantImages, setVariantImages] = useState([]);
    const variantImageInputRef = useRef(null);
    const addImageInputRef = useRef(null);

    // Lấy danh mục
    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .order("category_name");
            if (!error) setCategories(data);
        };
        fetchCategories();
    }, []);

    // Lấy danh sách sản phẩm
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            let query = supabase
                .from("products")
                .select("*, categories(*)")
                .order("created_at", { ascending: false });
            if (search) query = query.ilike("product_name", `%${search}%`);
            if (categoryFilter) query = query.eq("category_id", categoryFilter);
            if (statusFilter === "active") query = query.eq("is_active", true);
            if (statusFilter === "inactive")
                query = query.eq("is_active", false);
            const { data, error } = await query;
            if (!error) setProducts(data);
            setError(error ? error.message : null);
            setLoading(false);
        };
        fetchProducts();
    }, [search, categoryFilter, statusFilter, reload]);

    // Lấy biến thể khi chọn sản phẩm
    useEffect(() => {
        if (!selectedProductId) {
            setVariants([]);
            return;
        }
        const fetchVariants = async () => {
            setLoadingVariants(true);
            // Lấy tất cả màu của sản phẩm
            const { data: colors } = await supabase
                .from("product_colors")
                .select("*")
                .eq("product_id", selectedProductId);
            // Lấy tất cả size của sản phẩm
            const { data: sizes } = await supabase
                .from("product_sizes")
                .select("*")
                .eq("product_id", selectedProductId);
            // Lấy inventory
            const { data: inventory } = await supabase
                .from("product_inventory")
                .select("*")
                .in(
                    "color_id",
                    colors.map((c) => c.color_id),
                );
            // Lấy images
            const { data: images } = await supabase
                .from("product_images")
                .select("*")
                .in(
                    "color_id",
                    colors.map((c) => c.color_id),
                );
            // Gộp thành biến thể: mỗi biến thể là 1 inventory (color_id + size_id)
            const variants = inventory.map((inv) => {
                const color = colors.find((c) => c.color_id === inv.color_id);
                const size = sizes.find((s) => s.size_id === inv.size_id);
                const image = images.find(
                    (img) => img.color_id === inv.color_id && img.is_primary,
                );
                return {
                    inventory_id: inv.inventory_id,
                    color_id: color?.color_id,
                    color_name: color?.color_name,
                    color_code: color?.color_code,
                    size_id: size?.size_id,
                    size_name: size?.size_name,
                    price_adjustment:
                        color?.price_adjustment || size?.price_adjustment || 0,
                    stock_quantity: inv.stock_quantity,
                    image_url: image?.image_url || "",
                    images: images.filter(
                        (img) => img.color_id === inv.color_id,
                    ),
                };
            });
            setVariants(variants);
            setLoadingVariants(false);
        };
        fetchVariants();
    }, [selectedProductId, reload]);

    // Lấy danh sách ảnh của biến thể (theo color_id)
    const fetchVariantImages = async (colorId) => {
        if (!colorId) return setVariantImages([]);
        const { data } = await supabase
            .from("product_images")
            .select("*")
            .eq("color_id", colorId)
            .order("image_id", { ascending: true });
        setVariantImages(data || []);
    };

    // Xử lý chọn sản phẩm
    const handleSelectProduct = (product) => {
        setSelectedProductId(product.product_id);
        setSelectedProduct(product);
    };

    // Modal sản phẩm
    const openProductModal = (type, product = null) => {
        setModalType(type);
        setShowProductModal(true);
        if (type === "edit" && product) {
            setFormData({
                product_name: product.product_name,
                category_id: product.category_id,
                description: product.description,
                base_price: product.base_price,
                is_active: product.is_active,
            });
            setSelectedProduct(product);
        } else {
            setFormData({
                product_name: "",
                category_id: "",
                description: "",
                base_price: "",
                is_active: true,
            });
            setSelectedProduct(null);
        }
    };
    const closeProductModal = () => {
        setShowProductModal(false);
        setSelectedProduct(null);
    };
    const handleProductChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        if (modalType === "add") {
            // Tạo slug từ tên sản phẩm
            const slug = formData.product_name
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "") // loại bỏ dấu tiếng Việt
                .replace(/[^a-z0-9\s-]/g, "") // loại bỏ ký tự đặc biệt
                .trim()
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-");
            const { error } = await supabase.from("products").insert({
                product_name: formData.product_name,
                category_id: formData.category_id,
                description: formData.description,
                base_price: formData.base_price,
                is_active: formData.is_active,
                slug,
            });
            if (!error) {
                closeProductModal();
                setReload((r) => !r);
            }
        } else if (modalType === "edit" && selectedProduct) {
            // Tạo slug từ tên sản phẩm mới
            const slug = formData.product_name
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
                .replace(/[^a-z0-9\s-]/g, "")
                .trim()
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-");
            const { error } = await supabase
                .from("products")
                .update({
                    product_name: formData.product_name,
                    category_id: formData.category_id,
                    description: formData.description,
                    base_price: formData.base_price,
                    is_active: formData.is_active,
                    slug,
                })
                .eq("product_id", selectedProduct.product_id);
            if (!error) {
                closeProductModal();
                setReload((r) => !r);
            }
        }
    };

    // Modal biến thể
    const openVariantModal = (type, variant = null) => {
        setVariantModalType(type);
        setShowVariantModal(true);
        if (type === "edit" && variant) {
            setVariantForm({
                color_name: variant.color_name,
                color_code: variant.color_code || "#000000",
                size_name: variant.size_name,
                stock_quantity: variant.stock_quantity,
                image_url: variant.image_url,
            });
            setSelectedVariant(variant);
            fetchVariantImages(variant.color_id);
        } else {
            setVariantForm({
                color_name: "",
                color_code: "#000000",
                size_name: "",
                stock_quantity: 0,
                image_url: "",
            });
            setSelectedVariant(null);
            setVariantImages([]);
        }
        setVariantImageFiles([]);
        setVariantImageFile(null);
    };
    const closeVariantModal = () => {
        setShowVariantModal(false);
        setSelectedVariant(null);
        setVariantImageFile(null);
        setVariantImageFiles([]);
    };
    const handleVariantChange = (e) => {
        const { name, value } = e.target;
        setVariantForm((prev) => ({ ...prev, [name]: value }));
    };
    const handleVariantImageChange = (e) => {
        const files = Array.from(e.target.files);
        setVariantImageFiles(files);
        setVariantImageFile(files[0] || null);
        setVariantForm((prev) => ({
            ...prev,
            image_url: files[0] ? URL.createObjectURL(files[0]) : "",
        }));
    };
    const handleDeleteVariantImage = async (imageId) => {
        if (!window.confirm("Bạn có chắc muốn xóa hình này?")) return;
        await supabase.from("product_images").delete().eq("image_id", imageId);
        if (selectedVariant?.color_id)
            fetchVariantImages(selectedVariant.color_id);
    };
    const handleAddVariantImages = async (e) => {
        const files = Array.from(e.target.files);
        if (!selectedVariant?.color_id || files.length === 0) return;
        // Kiểm tra đã có ảnh nào cho color_id này chưa
        const { data: existImgs } = await supabase
            .from("product_images")
            .select("*")
            .eq("color_id", selectedVariant.color_id);
        const hasPrimary = existImgs && existImgs.some((img) => img.is_primary);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const imageUrl = await uploadImageToSupabase(
                file,
                selectedProductId,
                selectedVariant.color_name + "_" + Date.now() + "_" + i,
            );
            await supabase.from("product_images").insert({
                color_id: selectedVariant.color_id,
                image_url: imageUrl,
                is_primary:
                    (!existImgs || existImgs.length === 0) &&
                    !hasPrimary &&
                    i === 0,
            });
        }
        fetchVariantImages(selectedVariant.color_id);
        if (addImageInputRef.current) addImageInputRef.current.value = "";
    };
    const handleVariantSubmit = async (e) => {
        e.preventDefault();
        if (variantModalType === "edit" && selectedVariant) {
            // Chỉ cập nhật các trường thông tin biến thể, không upload hình mới
            await supabase
                .from("product_inventory")
                .update({
                    stock_quantity: variantForm.stock_quantity,
                })
                .eq("inventory_id", selectedVariant.inventory_id);
            closeVariantModal();
            setReload((r) => !r);
        } else if (variantModalType === "add") {
            // 1. Kiểm tra/tạo màu mới
            let color = null;
            let color_id = null;
            const { data: existColor } = await supabase
                .from("product_colors")
                .select("*")
                .eq("product_id", selectedProductId)
                .eq("color_name", variantForm.color_name)
                .maybeSingle();
            if (existColor) {
                color = existColor;
                color_id = color.color_id;
            } else {
                const { data: newColor, error: colorError } = await supabase
                    .from("product_colors")
                    .insert({
                        product_id: selectedProductId,
                        color_name: variantForm.color_name,
                        color_code: variantForm.color_code,
                    })
                    .select()
                    .single();
                if (colorError || !newColor) {
                    alert("Lỗi khi tạo màu mới!");
                    return;
                }
                color = newColor;
                color_id = color.color_id;
            }
            // 2. Kiểm tra/tạo size mới
            let size = null;
            let size_id = null;
            const { data: existSize } = await supabase
                .from("product_sizes")
                .select("*")
                .eq("product_id", selectedProductId)
                .eq("size_name", variantForm.size_name)
                .maybeSingle();
            if (existSize) {
                size = existSize;
                size_id = size.size_id;
            } else {
                const { data: newSize, error: sizeError } = await supabase
                    .from("product_sizes")
                    .insert({
                        product_id: selectedProductId,
                        size_name: variantForm.size_name,
                    })
                    .select()
                    .single();
                if (sizeError || !newSize) {
                    alert("Lỗi khi tạo size mới!");
                    return;
                }
                size = newSize;
                size_id = size.size_id;
            }
            // Log kiểm tra id
            console.log("color_id:", color_id, "size_id:", size_id);
            if (!color_id || !size_id) {
                alert("Không lấy được color_id hoặc size_id!");
                return;
            }
            // 3. Kiểm tra inventory đã tồn tại chưa
            const { data: existInv } = await supabase
                .from("product_inventory")
                .select("*")
                .eq("product_id", selectedProductId)
                .eq("color_id", color_id)
                .eq("size_id", size_id)
                .maybeSingle();
            if (existInv) {
                alert("Biến thể này đã tồn tại!");
                return;
            }
            // 4. Thêm inventory
            const { data: inventory, error: invError } = await supabase
                .from("product_inventory")
                .insert({
                    color_id: color_id,
                    size_id: size_id,
                    stock_quantity: variantForm.stock_quantity,
                })
                .select()
                .single();
            if (invError || !inventory) {
                alert("Lỗi khi tạo inventory!");
                return;
            }
            // 5. Upload nhiều hình và thêm product_images nếu có hình
            if (variantImageFiles && variantImageFiles.length > 0) {
                // Kiểm tra đã có ảnh nào cho color_id này chưa
                const { data: existImgs } = await supabase
                    .from("product_images")
                    .select("*")
                    .eq("color_id", color_id);
                const hasPrimary =
                    existImgs && existImgs.some((img) => img.is_primary);
                for (let i = 0; i < variantImageFiles.length; i++) {
                    const file = variantImageFiles[i];
                    const imageUrl = await uploadImageToSupabase(
                        file,
                        selectedProductId,
                        variantForm.color_name + "_" + i,
                    );
                    await supabase.from("product_images").insert({
                        color_id: color_id,
                        image_url: imageUrl,
                        is_primary:
                            (!existImgs || existImgs.length === 0) &&
                            !hasPrimary &&
                            i === 0,
                    });
                }
            }
            closeVariantModal();
            setReload((r) => !r);
        }
    };

    // Đặt làm hình chính
    const handleSetPrimaryImage = async (image) => {
        if (!image?.color_id || !image?.image_id) return;
        // 1. Update tất cả ảnh cùng color_id về false
        await supabase
            .from("product_images")
            .update({ is_primary: false })
            .eq("color_id", image.color_id);
        // 2. Update ảnh này về true
        await supabase
            .from("product_images")
            .update({ is_primary: true })
            .eq("image_id", image.image_id);
        fetchVariantImages(image.color_id);
    };

    return (
        <div className="min-h-screen pt-20 pb-12 px-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Bên trái: Danh sách sản phẩm */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
                        <button
                            onClick={() => openProductModal("add")}
                            className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
                        >
                            <FiPlus size={20} /> Thêm sản phẩm
                        </button>
                    </div>
                    <div className="flex gap-4 mb-4 items-center">
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            className="px-4 py-2 border rounded-lg text-gray-900 flex-1 min-w-[120px]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                            className="px-4 py-2 border rounded-lg text-gray-900 w-48 min-w-0"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map((c) => (
                                <option
                                    key={c.category_id}
                                    value={c.category_id}
                                >
                                    {c.category_name}
                                </option>
                            ))}
                        </select>
                        <select
                            className="px-4 py-2 border rounded-lg text-gray-900 w-40 min-w-0"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Đang bán</option>
                            <option value="inactive">Ngừng bán</option>
                        </select>
                    </div>
                    <div className="bg-white rounded-lg shadow overflow-x-auto">
                        {error && (
                            <div className="text-red-600 text-center py-2">
                                {error}
                            </div>
                        )}
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-gray-900">
                                        STT
                                    </th>
                                    <th className="px-4 py-2 text-left text-gray-900">
                                        Tên sản phẩm
                                    </th>
                                    <th className="px-4 py-2 text-left text-gray-900">
                                        Danh mục
                                    </th>
                                    <th className="px-4 py-2 text-left text-gray-900">
                                        Giá
                                    </th>
                                    <th className="px-4 py-2 text-left text-gray-900">
                                        Trạng thái
                                    </th>
                                    <th className="px-4 py-2 text-left text-gray-900">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="text-center py-8 text-gray-700"
                                        >
                                            Đang tải...
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="text-center py-8 text-gray-700"
                                        >
                                            Không có sản phẩm
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((p, idx) => (
                                        <tr
                                            key={p.product_id}
                                            className={`hover:bg-indigo-50 cursor-pointer ${selectedProductId === p.product_id ? "bg-indigo-100" : ""}`}
                                            onClick={() =>
                                                handleSelectProduct(p)
                                            }
                                        >
                                            <td className="px-4 py-2 text-center text-gray-900">
                                                {idx + 1}
                                            </td>
                                            <td className="px-4 py-2 text-gray-900">
                                                {p.product_name}
                                            </td>
                                            <td className="px-4 py-2 text-gray-900">
                                                {p.categories?.category_name ||
                                                    ""}
                                            </td>
                                            <td className="px-4 py-2 text-gray-900">
                                                {formatCurrency(p.base_price)}
                                            </td>
                                            <td className="px-4 py-2">
                                                <span
                                                    className={
                                                        p.is_active
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                    }
                                                >
                                                    {p.is_active
                                                        ? "Đang bán"
                                                        : "Ngừng bán"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 flex gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openProductModal(
                                                            "edit",
                                                            p,
                                                        );
                                                    }}
                                                    className="text-yellow-600 hover:text-yellow-800"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Bên phải: Danh sách biến thể */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Biến thể sản phẩm</h2>
                        {selectedProductId && (
                            <button
                                onClick={() => openVariantModal("add")}
                                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <FiPlus size={20} /> Thêm biến thể
                            </button>
                        )}
                    </div>
                    {/* Thêm div trống để cân đối layout với filter bên trái */}
                    <div className="mb-4" style={{ height: 44 }}></div>
                    {!selectedProductId ? (
                        <div className="text-gray-400 text-center mt-12">
                            Chọn một sản phẩm để xem biến thể
                        </div>
                    ) : loadingVariants ? (
                        <div className="text-gray-700 text-center mt-12">
                            Đang tải biến thể...
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-gray-900">
                                            STT
                                        </th>
                                        <th className="px-4 py-2 text-left text-gray-900">
                                            Màu
                                        </th>
                                        <th className="px-4 py-2 text-left text-gray-900">
                                            Mã màu
                                        </th>
                                        <th className="px-4 py-2 text-left text-gray-900">
                                            Size
                                        </th>
                                        <th className="px-4 py-2 text-left text-gray-900">
                                            Số lượng
                                        </th>
                                        <th className="px-4 py-2 text-left text-gray-900">
                                            Hình ảnh
                                        </th>
                                        <th className="px-4 py-2 text-left text-gray-900">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {variants.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="text-center py-8 text-gray-700"
                                            >
                                                Không có biến thể
                                            </td>
                                        </tr>
                                    ) : (
                                        variants.map((v, idx) => (
                                            <tr
                                                key={v.inventory_id}
                                                className="hover:bg-indigo-50"
                                            >
                                                <td className="px-4 py-2 text-center text-gray-900">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-2 text-gray-900">
                                                    {v.color_name}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span
                                                        className="inline-block w-6 h-6 rounded-full border"
                                                        style={{
                                                            background:
                                                                v.color_code,
                                                        }}
                                                        title={v.color_code}
                                                    ></span>
                                                </td>
                                                <td className="px-4 py-2 text-gray-900">
                                                    {v.size_name}
                                                </td>
                                                <td className="px-4 py-2 text-gray-900">
                                                    {v.stock_quantity}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {v.images &&
                                                    v.images.length > 0 ? (
                                                        <div className="flex gap-1">
                                                            {v.images
                                                                .slice(0, 2)
                                                                .map(
                                                                    (
                                                                        img,
                                                                        i,
                                                                    ) => (
                                                                        <img
                                                                            key={
                                                                                i
                                                                            }
                                                                            src={
                                                                                img.image_url
                                                                            }
                                                                            alt="variant"
                                                                            className="w-12 h-12 object-cover rounded"
                                                                        />
                                                                    ),
                                                                )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">
                                                            <FiImage />
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 flex gap-2">
                                                    <button
                                                        onClick={() =>
                                                            openVariantModal(
                                                                "edit",
                                                                v,
                                                            )
                                                        }
                                                        className="text-yellow-600 hover:text-yellow-800"
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            {/* Modal sản phẩm */}
            {showProductModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-lg p-6 relative shadow-xl">
                        <button
                            onClick={closeProductModal}
                            className="absolute top-2 right-2 text-gray-500 hover:text-black"
                        >
                            <FiX size={24} />
                        </button>
                        <h2 className="text-xl font-semibold mb-4 text-gray-900">
                            {modalType === "add"
                                ? "Thêm sản phẩm"
                                : "Cập nhật sản phẩm"}
                        </h2>
                        <form
                            onSubmit={handleProductSubmit}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block mb-1 text-gray-900">
                                    Tên sản phẩm
                                </label>
                                <input
                                    type="text"
                                    name="product_name"
                                    value={formData.product_name}
                                    onChange={handleProductChange}
                                    className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-gray-900">
                                    Danh mục
                                </label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleProductChange}
                                    className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                                    required
                                >
                                    <option value="">Chọn danh mục</option>
                                    {categories.map((c) => (
                                        <option
                                            key={c.category_id}
                                            value={c.category_id}
                                        >
                                            {c.category_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1 text-gray-900">
                                    Mô tả
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleProductChange}
                                    className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-gray-900">
                                    Giá cơ bản
                                </label>
                                <input
                                    type="number"
                                    name="base_price"
                                    value={formData.base_price}
                                    onChange={handleProductChange}
                                    className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleProductChange}
                                />
                                <span className="text-gray-900">Đang bán</span>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={closeProductModal}
                                    className="px-4 py-2 border rounded text-gray-900 bg-gray-100"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-500 text-white rounded"
                                >
                                    {modalType === "add"
                                        ? "Thêm mới"
                                        : "Cập nhật"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal biến thể */}
            {showVariantModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-lg p-6 relative shadow-xl">
                        <button
                            onClick={closeVariantModal}
                            className="absolute top-2 right-2 text-gray-500 hover:text-black"
                        >
                            <FiX size={24} />
                        </button>
                        <h2 className="text-xl font-semibold mb-4 text-gray-900">
                            {variantModalType === "add"
                                ? "Thêm biến thể"
                                : "Cập nhật biến thể"}
                        </h2>
                        <form
                            onSubmit={handleVariantSubmit}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block mb-1 text-gray-900">
                                    Tên màu
                                </label>
                                <input
                                    type="text"
                                    name="color_name"
                                    value={variantForm.color_name}
                                    onChange={handleVariantChange}
                                    className={`w-full border rounded px-3 py-2 text-gray-900 ${variantModalType === "edit" ? "bg-gray-100" : "bg-white"}`}
                                    required
                                    readOnly={variantModalType === "edit"}
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-gray-900">
                                    Mã màu
                                </label>
                                <input
                                    type="color"
                                    name="color_code"
                                    value={variantForm.color_code}
                                    onChange={handleVariantChange}
                                    className="w-16 h-10 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-gray-900">
                                    Kích thước
                                </label>
                                <input
                                    type="text"
                                    name="size_name"
                                    value={variantForm.size_name}
                                    onChange={handleVariantChange}
                                    className={`w-full border rounded px-3 py-2 text-gray-900 ${variantModalType === "edit" ? "bg-gray-100" : "bg-white"}`}
                                    required
                                    readOnly={variantModalType === "edit"}
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-gray-900">
                                    Số lượng tồn kho
                                </label>
                                <input
                                    type="number"
                                    name="stock_quantity"
                                    value={variantForm.stock_quantity}
                                    onChange={handleVariantChange}
                                    className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                                />
                            </div>
                            {/* Danh sách hình ảnh hiện có (chỉ khi edit) */}
                            {variantModalType === "edit" &&
                                variantImages &&
                                variantImages.length > 0 && (
                                    <div>
                                        <label className="block mb-1 text-gray-900">
                                            Hình ảnh hiện có
                                        </label>
                                        <div className="flex gap-2 flex-wrap">
                                            {variantImages.map((img) => (
                                                <div
                                                    key={img.image_id}
                                                    className="relative group"
                                                >
                                                    {img.is_primary && (
                                                        <span className="absolute top-0 left-0 bg-green-500 text-white text-xs px-2 py-0.5 rounded-br z-10">
                                                            Chính
                                                        </span>
                                                    )}
                                                    <img
                                                        src={img.image_url}
                                                        alt="variant"
                                                        className="w-20 h-20 object-cover rounded"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteVariantImage(
                                                                img.image_id,
                                                            )
                                                        }
                                                        className="absolute top-0 right-0 bg-white bg-opacity-80 rounded-full p-1 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <FiX size={18} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleSetPrimaryImage(
                                                                img,
                                                            )
                                                        }
                                                        className="absolute bottom-0 right-0 bg-white bg-opacity-80 rounded px-2 py-0.5 text-xs text-indigo-600 border border-indigo-400 hover:bg-indigo-100"
                                                    >
                                                        Đặt làm hình chính
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            <div>
                                <label className="block mb-1 text-gray-900">
                                    Hình ảnh
                                </label>
                                {/* Nút thêm hình mới riêng biệt, chỉ khi edit */}
                                {variantModalType === "edit" && (
                                    <>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            ref={addImageInputRef}
                                            onChange={handleAddVariantImages}
                                        />
                                    </>
                                )}
                                {/* Khi thêm mới biến thể */}
                                {variantModalType === "add" && (
                                    <>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleVariantImageChange}
                                            ref={variantImageInputRef}
                                        />
                                        {variantImageFiles &&
                                            variantImageFiles.length > 0 && (
                                                <div className="flex gap-2 mt-2">
                                                    {variantImageFiles.map(
                                                        (file, i) => (
                                                            <img
                                                                key={i}
                                                                src={URL.createObjectURL(
                                                                    file,
                                                                )}
                                                                alt="preview"
                                                                className="w-20 h-20 object-cover rounded"
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                    </>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={closeVariantModal}
                                    className="px-4 py-2 border rounded text-gray-900 bg-gray-100"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-500 text-white rounded"
                                >
                                    {variantModalType === "add"
                                        ? "Thêm mới"
                                        : "Cập nhật"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagementPage;
