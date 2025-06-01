import axios from 'axios';

const API_KEY = 'sk-bVPa2eTJpsiShjZCzqVKPaW4BZw1I6IOPcJfx5fx8xmmhNHl';
const BASE_URL = "https://api.hunyuan.cloud.tencent.com/v1";

// 高德天气配置
const AMAP_API_KEY = '2c38f4852795d965e4f2eeed49473fd6';
const AMAP_BASE_URL = 'https://restapi.amap.com/v3';
const JIADING_ADCODE = '310114'; // 上海嘉定区的固定编码

const hunyuanApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
    }
});

const amapApi = axios.create({
    baseURL: AMAP_BASE_URL
});

export const chatCompletion = async (messages, model = 'hunyuan-pro', temperature = 0.7) => {
    try {
        const response = await hunyuanApi.post('/chat/completions', {
            model,
            messages,
            temperature
        });
        return response.data;
    } catch (error) {
        console.error('Error calling Hunyuan API:', error);
        throw error;
    }
};
// 高德天气API方法 - 固定查询上海嘉定区
export const getJiadingWeather = async (extensions = 'base') => {
    try {
        const response = await amapApi.get('/weather/weatherInfo', {
            params: {
                key: AMAP_API_KEY,
                city: JIADING_ADCODE, // 固定使用嘉定区编码
                extensions
            }
        });

        if (response.data.status === '1') {
            return extensions === 'base'
                ? response.data.lives[0]
                : response.data.forecasts[0];
        } else {
            throw new Error(response.data.info || '获取嘉定天气失败');
        }
    } catch (error) {
        console.error('Error fetching Jiading weather:', error);
        throw error;
    }
};

// 默认导出所有API方法
export default {
    chatCompletion,
    getJiadingWeather
};