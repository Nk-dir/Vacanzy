const Reservation = require("../models/reservation");
const Listing = require("../models/listing");

module.exports.showDashboard = async (req, res) => {
    try {
        // Get all reservations where user is a guest
        const guestReservations = await Reservation.find({ guest: req.user._id })
            .populate('listing')
            .sort({ createdAt: -1 });

        // Get all properties owned by the user
        const ownedProperties = await Listing.find({ owner: req.user._id });
        
        // Get all reservations for properties owned by the user
        const hostReservations = await Reservation.find({ 
            listing: { $in: ownedProperties.map(p => p._id) }
        })
            .populate('listing')
            .populate('guest', 'username email')
            .sort({ createdAt: -1 });

        // Separate guest bookings by status
        const upcomingBookings = guestReservations.filter(r => 
            r.status === 'confirmed' && new Date(r.checkIn) > new Date()
        );
        
        const currentBookings = guestReservations.filter(r => 
            r.status === 'confirmed' && 
            new Date(r.checkIn) <= new Date() && 
            new Date(r.checkOut) > new Date()
        );
        
        const pastBookings = guestReservations.filter(r => 
            new Date(r.checkOut) <= new Date()
        );

        const cancelledBookings = guestReservations.filter(r => 
            r.status === 'cancelled'
        );

        // Separate host reservations by status
        const upcomingGuests = hostReservations.filter(r => 
            r.status === 'confirmed' && new Date(r.checkIn) > new Date()
        );
        
        const currentGuests = hostReservations.filter(r => 
            r.status === 'confirmed' && 
            new Date(r.checkIn) <= new Date() && 
            new Date(r.checkOut) > new Date()
        );
        
        const pastGuests = hostReservations.filter(r => 
            new Date(r.checkOut) <= new Date()
        );

        const cancelledReservations = hostReservations.filter(r => 
            r.status === 'cancelled'
        );

        // Calculate host earnings
        const totalEarnings = hostReservations
            .filter(r => r.status === 'confirmed' && new Date(r.checkOut) <= new Date())
            .reduce((sum, r) => sum + r.totalPrice, 0);

        res.render("dashboard/index", {
            user: req.user,
            // Guest data
            upcomingBookings: upcomingBookings || [],
            currentBookings: currentBookings || [],
            pastBookings: pastBookings || [],
            cancelledBookings: cancelledBookings || [],
            totalBookings: guestReservations.length || 0,
            // Host data
            ownedProperties: ownedProperties || [],
            upcomingGuests: upcomingGuests || [],
            currentGuests: currentGuests || [],
            pastGuests: pastGuests || [],
            cancelledReservations: cancelledReservations || [],
            totalReservations: hostReservations.length || 0,
            totalEarnings: totalEarnings || 0
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        req.flash("error", "Failed to load dashboard");
        res.redirect("/listings");
    }
};

module.exports.showProfile = async (req, res) => {
    try {
        const totalBookings = await Reservation.countDocuments({ guest: req.user._id });
        const totalSpent = await Reservation.aggregate([
            { $match: { guest: req.user._id, status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);

        // Calculate additional stats
        const totalNights = await Reservation.aggregate([
            { $match: { guest: req.user._id, status: 'confirmed' } },
            { $group: { _id: null, nights: { $sum: { $divide: [{ $subtract: ["$checkOut", "$checkIn"] }, 1000 * 60 * 60 * 24] } } } }
        ]);

        const citiesVisited = await Reservation.aggregate([
            { $match: { guest: req.user._id, status: 'confirmed' } },
            { $lookup: { from: 'listings', localField: 'listing', foreignField: '_id', as: 'listingData' } },
            { $unwind: '$listingData' },
            { $group: { _id: '$listingData.location' } },
            { $count: 'total' }
        ]);

        res.render("dashboard/profile", {
            user: req.user,
            totalBookings,
            totalSpent: totalSpent[0]?.total || 0,
            totalNights: Math.round(totalNights[0]?.nights || 0),
            citiesVisited: citiesVisited[0]?.total || 0
        });
    } catch (error) {
        console.error("Profile error:", error);
        req.flash("error", "Failed to load profile");
        res.redirect("/dashboard");
    }
};

module.exports.updateProfile = async (req, res) => {
    try {
        const { email, firstName, lastName, phoneNumber, dateOfBirth, address, bio } = req.body;
        const userId = req.user._id;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.json({ success: false, message: "Invalid email format" });
        }

        // Check if email is already taken by another user
        const User = require("../models/user");
        const existingUser = await User.findOne({ email: email, _id: { $ne: userId } });
        if (existingUser) {
            return res.json({ success: false, message: "Email already in use by another user" });
        }

        // Update user profile
        const updateData = {
            email,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            phoneNumber: phoneNumber || undefined,
            address: address || undefined,
            bio: bio || undefined
        };

        // Only add dateOfBirth if it's provided
        if (dateOfBirth) {
            updateData.dateOfBirth = new Date(dateOfBirth);
        }

        // Remove undefined values
        Object.keys(updateData).forEach(key => 
            updateData[key] === undefined && delete updateData[key]
        );

        await User.findByIdAndUpdate(userId, updateData, { new: true });

        res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        console.error("Update profile error:", error);
        res.json({ success: false, message: "Failed to update profile" });
    }
};