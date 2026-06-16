import { useSelector, useDispatch } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';

export const useWishlist = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.wishlist);

  const isWishlisted = (id) => items.some((i) => i._id === id || i === id);
  const toggle = (id) => isWishlisted(id) ? dispatch(removeFromWishlist(id)) : dispatch(addToWishlist(id));

  return { items, isWishlisted, toggle };
};
