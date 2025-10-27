import { useState } from 'react'
import { CreditCard, Plus, X, Edit3 } from 'lucide-react'
import { countries } from '../../data/countries'

const AddPaymentMethod = () => {
    const [activeTab, setActiveTab] = useState('payment')
    const [showAddCard, setShowAddCard] = useState(false)
    const [paymentMethods] = useState([
        {
            id: 1,
            type: 'visa',
            last4: '4321',
            expiryMonth: '12',
            expiryYear: '25',
            holderName: 'John Doe',
            isDefault: true
        }
    ])

    const [newCard, setNewCard] = useState({
        cardNumber: '',
        expiryDate: '',
        cvc: '',
        holderName: '',
        country: 'United States',
        saveInfo: false
    })

    const handleCardChange = (e) => {
        const { name, value, type, checked } = e.target
        setNewCard(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleAddCard = (e) => {
        e.preventDefault()
        // Add card logic here
        console.log('Adding new card:', newCard)
        setShowAddCard(false)
        setNewCard({
            cardNumber: '',
            expiryDate: '',
            cvc: '',
            holderName: '',
            country: 'United States',
            saveInfo: false
        })
    }

    const getCardIcon = (type) => {
        switch (type) {
            case 'visa':
                return (
                    <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                        VISA
                    </div>
                )
            case 'mastercard':
                return (
                    <div className="w-12 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                        MC
                    </div>
                )
            default:
                return <CreditCard className="w-6 h-6 text-gray-400" />
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Banner */}
            <div className="relative h-64 bg-gradient-to-r from-teal-600 via-orange-400 to-yellow-400 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600/90 via-orange-400/90 to-yellow-400/90"></div>

                {/* Profile Section */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
                    <div className="w-24 h-24 rounded-full bg-white p-1 mb-4">
                        <img
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>

                    <h2 className="text-2xl font-bold mb-1">John Doe</h2>
                    <p className="text-white/80">john.doe@gmail.com</p>

                    <button className="mt-4 px-6 py-2 bg-teal-500 hover:bg-teal-600 rounded-lg font-medium transition-colors">
                        Upload new picture
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-8 pt-6">
                            <button
                                onClick={() => setActiveTab('account')}
                                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'account'
                                        ? 'border-teal-500 text-teal-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Account
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history'
                                        ? 'border-teal-500 text-teal-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                History
                            </button>
                            <button
                                onClick={() => setActiveTab('payment')}
                                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'payment'
                                        ? 'border-teal-500 text-teal-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Payment methods
                            </button>
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-gray-900">Payment methods</h3>
                        </div>

                        {/* Payment Methods Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Existing Payment Methods */}
                            {paymentMethods.map((method) => (
                                <div key={method.id} className="relative">
                                    <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 text-white h-48 flex flex-col justify-between">
                                        <div className="flex items-center justify-between">
                                            {getCardIcon(method.type)}
                                            <button className="p-1 hover:bg-white/20 rounded">
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div>
                                            <div className="text-lg font-mono tracking-wider mb-2">
                                                •••• •••• •••• {method.last4}
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span>{method.holderName}</span>
                                                <span>{method.expiryMonth}/{method.expiryYear}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {method.isDefault && (
                                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                            Default
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Add New Card Button */}
                            <button
                                onClick={() => setShowAddCard(true)}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-6 h-48 flex flex-col items-center justify-center text-gray-500 hover:border-teal-500 hover:text-teal-500 transition-colors"
                            >
                                <Plus className="w-8 h-8 mb-2" />
                                <span className="font-medium">Add new card</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Card Modal */}
            {showAddCard && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Add a new Card</h3>
                            <button
                                onClick={() => setShowAddCard(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddCard} className="space-y-4">
                            {/* Card Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Card number
                                </label>
                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={newCard.cardNumber}
                                    onChange={handleCardChange}
                                    placeholder="1234 1234 1234 1234"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    required
                                />
                            </div>

                            {/* Expiry and CVC */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Exp. Date
                                    </label>
                                    <input
                                        type="text"
                                        name="expiryDate"
                                        value={newCard.expiryDate}
                                        onChange={handleCardChange}
                                        placeholder="MM/YY"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        CVC
                                    </label>
                                    <input
                                        type="text"
                                        name="cvc"
                                        value={newCard.cvc}
                                        onChange={handleCardChange}
                                        placeholder="123"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Cardholder Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name on Card
                                </label>
                                <input
                                    type="text"
                                    name="holderName"
                                    value={newCard.holderName}
                                    onChange={handleCardChange}
                                    placeholder="John Doe"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    required
                                />
                            </div>

                            {/* Country */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Country or Region
                                </label>
                                <select
                                    name="country"
                                    value={newCard.country}
                                    onChange={handleCardChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    {countries.slice(0, 10).map((country) => (
                                        <option key={country.code} value={country.name}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Save Info Checkbox */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="saveInfo"
                                    checked={newCard.saveInfo}
                                    onChange={handleCardChange}
                                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Securely save my information for 1-click checkout
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-teal-500 text-white py-3 px-4 rounded-lg hover:bg-teal-600 transition-colors font-medium"
                            >
                                Add Card
                            </button>

                            {/* Terms */}
                            <p className="text-xs text-gray-500 text-center">
                                By confirming your subscription, you allow Dream Holidays to charge your card for this payment and future payments in accordance with their terms.
                            </p>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AddPaymentMethod