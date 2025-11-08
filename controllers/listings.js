const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  let allListings = await Listing.find();
  res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let url = req.file?.path;
  let filename = req.file?.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  if (url && filename) {
    newListing.image = { filename, url };
  }
  // Geometry is optional; skip geocoding
  await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you trying to edit for does not exist!");
    res.redirect("/listings");
  }
  let imageUrl = listing.image && listing.image.url ? listing.image.url : null;
  if (imageUrl) {
    imageUrl = imageUrl.replace("/upload", "/upload/w_250,h_160");
  }
  res.render("listings/edit.ejs", { listing, imageUrl });
};

module.exports.updateListing = async (req, res, next) => {
  let { id } = req.params;
  let updatedListing = await Listing.findByIdAndUpdate(id, {
    ...req.body.listing,
  });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    updatedListing.image = { url, filename };
    await updatedListing.save();
  }
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.filter = async (req, res, next) => {
  let { id } = req.params;
  let allListings = await Listing.find({ category: { $all: [id] } });
  if (allListings.length != 0) {
    res.locals.success = `Listings Filtered by ${id}!`;
    res.render("listings/index.ejs", { allListings });
  } else {
    req.flash("error", `There is no any Listing for ${id}!`);
    res.redirect("/listings");
  }
};

module.exports.search = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) {
      req.flash("error", "Please enter search query!");
      return res.redirect("/listings");
    }

    const element = q.replace(/\s+/g, " ");

    // 1) Title
    let allListings = await Listing.find({
      title: { $regex: element, $options: "i" },
    });
    if (allListings.length) {
      res.locals.success = "Listings searched by Title!";
      return res.render("listings/index.ejs", { allListings });
    }

    // 2) Category
    allListings = await Listing.find({
      category: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });
    if (allListings.length) {
      res.locals.success = "Listings searched by Category!";
      return res.render("listings/index.ejs", { allListings });
    }

    // 3) Country
    allListings = await Listing.find({
      country: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });
    if (allListings.length) {
      res.locals.success = "Listings searched by Country!";
      return res.render("listings/index.ejs", { allListings });
    }

    // 4) Location
    allListings = await Listing.find({
      location: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });
    if (allListings.length) {
      res.locals.success = "Listings searched by Location!";
      return res.render("listings/index.ejs", { allListings });
    }

    // 5) Price (numeric)
    const intValue = parseInt(element, 10);
    if (!Number.isNaN(intValue)) {
      allListings = await Listing.find({ price: { $lte: intValue } }).sort({
        price: 1,
      });
      if (allListings.length) {
        res.locals.success = `Listings priced at or below ${intValue}!`;
        return res.render("listings/index.ejs", { allListings });
      }
    }

    // Render index with noResults flag instead of redirecting
    return res.render("listings/index.ejs", { allListings: [], noResults: true, query: element });
  } catch (err) {
    console.error("Search error:", err);
    req.flash("error", "Something went wrong while searching.");
    return res.redirect("/listings");
  }
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};

module.exports.reserveListing = async (req, res) => {
  let { id } = req.params;
  req.flash("success", "Reservation Details sent to your Email!");
  res.redirect(`/listings/${id}`);
};
