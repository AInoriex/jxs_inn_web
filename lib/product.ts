import { toast } from 'sonner';
import { ROUTER_SERVICE_HOST, ServerApiCommonResponse } from '@/lib/utils';

// 定义接口返回的原始数据类型（与后端返回结构一致）
interface RawProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
  sales: number;
}

// 定义产品列表接口返回的具体结构
interface ProductListResponse {
  result: RawProduct[];
}

// 封装产品列表获取接口
export async function FetchProductList() {
  try {
    const timestamp = Date.now();
    const response = await fetch(
      `${ROUTER_SERVICE_HOST}/v1/eshop_api/product/list?sign=${timestamp}`
    );
    
    if (!response.ok) throw new Error(`获取商品信息失败: ${response.status}`);

    const json_data: ServerApiCommonResponse<ProductListResponse> = await response.json();
    
    if (json_data.code !== 0) {
      toast.error(`获取商品信息失败: ${json_data.msg} (code: ${json_data.code})`);
      return null;  
    }

    // 转换为前端需要的格式（与组件类型定义保持一致）
    return json_data.data.result.map((raw) => ({
      id: raw.id.toString(),
      title: raw.title,
      description: raw.description,
      price: raw.price,
      image: raw.image_url,
      sales: raw.sales,
    }));

  } catch (error) {
    toast.error('获取商品失败，请稍后重试');
    console.error(`获取商品失败，错误信息：${error}`);
    return null;
  }
}