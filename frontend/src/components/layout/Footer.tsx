import { Link } from 'react-router-dom';
import { FiFacebook, FiMapPin, FiMail, FiPhone } from 'react-icons/fi';

export const Footer = () => (
  <footer className="mt-24 border-t border-ink/10 bg-ink text-paper/80">
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-14 sm:px-6 md:grid-cols-4">
      <div className="col-span-2 md:col-span-1">
        <p className="font-display text-2xl text-paper">Smaterr Roboticz</p>
        <p className="mt-3 max-w-xs text-sm text-paper/60">
          Electronics, robotics, IoT, and automation parts for makers, students, institutions, and engineers.
        </p>
        <div className="mt-4 flex gap-3 text-paper/60">
          <FiFacebook className="h-4 w-4" />
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-paper/50">Shop</p>
        <ul className="space-y-2 text-sm">
          <li><Link to="/shop" className="hover:text-amber">All products</Link></li>
          <li><Link to="/shop?featured=true" className="hover:text-amber">Featured</Link></li>
          <li><Link to="/shop?bestSeller=true" className="hover:text-amber">Best sellers</Link></li>
          <li><Link to="/shop?newArrival=true" className="hover:text-amber">New arrivals</Link></li>
        </ul>
      </div>
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-paper/50">Account</p>
        <ul className="space-y-2 text-sm">
          <li><Link to="/profile" className="hover:text-amber">My orders</Link></li>
          <li><Link to="/wishlist" className="hover:text-amber">Wishlist</Link></li>
          <li><Link to="/cart" className="hover:text-amber">Cart</Link></li>
        </ul>
      </div>
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-paper/50">Contacts</p>
        <ul className="space-y-2 text-sm text-paper/70">
          <li className="flex gap-2"><FiMapPin className="mt-0.5 h-4 w-4 shrink-0" /> Mid Baneswor, Kathmandu, Nepal</li>
          <li className="flex gap-2"><FiPhone className="mt-0.5 h-4 w-4 shrink-0" /> 9801045129</li>
          <li className="flex gap-2"><FiMail className="mt-0.5 h-4 w-4 shrink-0" /> support@smaterrroboticz.example</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-paper/10 px-4 py-4 text-center text-xs text-paper/40 sm:px-6">
      © {new Date().getFullYear()} Smaterr Roboticz. All rights reserved.
    </div>
  </footer>
);
