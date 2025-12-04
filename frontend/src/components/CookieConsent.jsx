import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [preferences, setPreferences] = useState({
        essential: true,
        analytics: false,
        marketing: false
    });
    const { user } = useAuth();

    useEffect(() => {
        const consent = localStorage.getItem('cookiePreferences');
        if (!consent) {
            setIsVisible(true);
        } else {
            // Check if we need to run analytics (location) logic on load for returning users
            const prefs = JSON.parse(consent);
            if (prefs.analytics) {
                collectLocation();
            }
        }
    }, []);

    const collectLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                if (user) {
                    try {
                        await api.patch('/users/me/location', { latitude, longitude });
                        console.log('Location updated successfully');
                    } catch (error) {
                        console.error('Error updating location:', error);
                    }
                } else {
                    // Check if we already recorded this visitor in this session
                    if (!sessionStorage.getItem('visitorRecorded')) {
                        try {
                            await api.post('/analytics/visitor', { latitude, longitude });
                            console.log('Visitor location recorded successfully');
                            sessionStorage.setItem('visitorRecorded', 'true');
                        } catch (error) {
                            console.error('Error recording visitor location:', error);
                        }
                    }
                }
            }, (error) => {
                console.error('Error getting location:', error);
            });
        }
    };

    const handleAcceptAll = () => {
        const newPrefs = { essential: true, analytics: true, marketing: true };
        setPreferences(newPrefs);
        savePreferences(newPrefs);
    };

    const handleSaveSettings = () => {
        savePreferences(preferences);
    };

    const savePreferences = (prefs) => {
        localStorage.setItem('cookiePreferences', JSON.stringify(prefs));
        setIsVisible(false);
        setShowSettings(false);

        if (prefs.analytics) {
            collectLocation();
        }
    };

    const togglePreference = (key) => {
        if (key === 'essential') return; // Always true
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (!isVisible) return null;

    if (showSettings) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                    <h2 className="text-2xl font-bold mb-4">การตั้งค่าความเป็นส่วนตัว</h2>

                    <div className="space-y-6">
                        {/* Essential Cookies */}
                        <div className="border-b pb-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-semibold">คุกกี้พื้นฐานที่จำเป็น</h3>
                                <span className="text-sm text-green-600 font-medium">เปิดใช้งานตลอดเวลา</span>
                            </div>
                            <p className="text-gray-600 text-sm">
                                คุกกี้พื้นฐานที่จำเป็น เพื่อช่วยให้การทำงานหลักของเว็บไซต์ใช้งานได้ รวมถึงการเข้าถึงพื้นที่ที่ปลอดภัยต่าง ๆ ของเว็บไซต์ หากไม่มีคุกกี้นี้เว็บไซต์จะไม่สามารถทำงานได้อย่างเหมาะสม และจะใช้งานได้โดยการตั้งค่าเริ่มต้น โดยไม่สามารถปิดการใช้งานได้
                            </p>
                        </div>

                        {/* Analytics Cookies */}
                        <div className="border-b pb-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-semibold">คุกกี้ในส่วนวิเคราะห์</h3>
                                <button
                                    onClick={() => togglePreference('analytics')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.analytics ? 'bg-blue-600' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.analytics ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <p className="text-gray-600 text-sm">
                                คุกกี้ในส่วนวิเคราะห์ จะช่วยให้เว็บไซต์เข้าใจรูปแบบการใช้งานของผู้เข้าชมและจะช่วยปรับปรุงประสบการณ์การใช้งาน โดยการเก็บรวบรวมข้อมูลและรายงานผลการใช้งานของผู้ใช้งาน
                            </p>
                        </div>

                        {/* Marketing Cookies */}
                        <div className="border-b pb-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-semibold">คุกกี้ในส่วนการตลาด</h3>
                                <button
                                    onClick={() => togglePreference('marketing')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.marketing ? 'bg-blue-600' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.marketing ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <p className="text-gray-600 text-sm">
                                คุกกี้ในส่วนการตลาด ใช้เพื่อติดตามพฤติกรรมผู้เข้าชมเว็บไซต์เพื่อแสดงโฆษณาที่เหมาะสมสำหรับผู้ใช้งานแต่ละรายและเพื่อเพิ่มประสิทธิผลการโฆษณาสำหรับผู้เผยแพร่และผู้โฆษณาสำหรับบุคคลที่สาม
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            onClick={handleSaveSettings}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            บันทึกการตั้งค่า
                        </button>
                        <button
                            onClick={handleAcceptAll}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                        >
                            ยอมรับทั้งหมด
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50 flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0 text-center sm:text-left">
                <p className="text-sm">
                    เว็บไซต์นี้ใช้คุกกี้เพื่อปรับปรุงประสบการณ์การใช้งานของคุณ
                </p>
            </div>
            <div className="flex space-x-4">
                <button
                    onClick={() => setShowSettings(true)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium transition-colors"
                >
                    ตั้งค่าคุ๊กกี้
                </button>
                <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
                >
                    ยอมรับทั้งหมด
                </button>
            </div>
        </div>
    );
}
