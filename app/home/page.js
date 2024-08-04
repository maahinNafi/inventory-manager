'use client';

import { useState, useEffect } from "react";
import { firestore, auth } from '@/firebase';
import { Box, Typography, Button, TextField, Grid, Card, CardContent, CircularProgress, Snackbar } from '@mui/material';
import { collection, query, getDocs, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/navigation';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        updateInventory(currentUser.uid); 
      } else {
        router.push('/sign-in'); 
      }
    });
    return () => unsubscribe(); 
  }, [router]);

  // Function to update inventory from Firestore
  const updateInventory = async (userId) => {
    setLoading(true);
    try {
      const userCollection = collection(firestore, `users/${userId}/inventory`);
      const snapshot = query(userCollection);
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({
          name: doc.id,
          ...doc.data(),
        });
      });
      setInventory(inventoryList);
    } catch (error) {
      console.error("Error updating inventory:", error);
      setSnackbarMessage('Failed to update inventory. Please try again.');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Function to add an item to the inventory
  const addItem = async (item) => {
    if (!user) return;
    try {
      const userCollection = collection(firestore, `users/${user.uid}/inventory`);
      const docRef = doc(userCollection, item.name);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + item.quantity }, { merge: true });
      } else {
        await setDoc(docRef, { quantity: item.quantity });
      }
      setSnackbarMessage(`Added ${item.name} to inventory with quantity ${item.quantity}.`);
      setOpenSnackbar(true);
      await updateInventory(user.uid);
    } catch (error) {
      console.error("Error adding item:", error);
      setSnackbarMessage('Failed to add item. Please try again.');
      setOpenSnackbar(true);
    }
  };

  // Function to remove an item from the inventory
  const removeItem = async (item) => {
    if (!user) return;
    try {
      const userCollection = collection(firestore, `users/${user.uid}/inventory`);
      const docRef = doc(userCollection, item.name);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - 1 }, { merge: true });
        }
      }
      setSnackbarMessage(`Removed ${item.name} from inventory.`);
      setOpenSnackbar(true);
      await updateInventory(user.uid);
    } catch (error) {
      console.error("Error removing item:", error);
      setSnackbarMessage('Failed to remove item. Please try again.');
      setOpenSnackbar(true);
    }
  };

  // Function to handle adding new item from input field
  const handleAddNewItem = async () => {
    if (!newItemName.trim()) {
      setSnackbarMessage('Item name cannot be empty.');
      setOpenSnackbar(true);
      return;
    }
    if (!newItemQuantity || isNaN(newItemQuantity) || parseInt(newItemQuantity, 10) <= 0) {
      setSnackbarMessage('Quantity must be a positive number.');
      setOpenSnackbar(true);
      return;
    }
    await addItem({ name: newItemName, quantity: parseInt(newItemQuantity, 10) });
    setNewItemName('');
    setNewItemQuantity('');
  };

  // Filter inventory based on search term
  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      sx={{
        padding: 3,
        backgroundColor: '#f9f9f9',
        minHeight: '100vh',
      }}
    >
      {/* Centered Title */}
      <Typography variant="h2" gutterBottom sx={{ textAlign: 'center', marginBottom: 4 }}>
        Inventory Manager
      </Typography>

      {user ? (
        <>
          {/* Centered Add New Item Section */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
            <TextField
              label="New Item Name"
              variant="outlined"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              sx={{ marginRight: 2 }}
            />
            <TextField
              label="Quantity"
              variant="outlined"
              type="number"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              sx={{ marginRight: 2, width: '100px' }}
            />
            <Button variant="contained" color="primary" onClick={handleAddNewItem}>
              Add New Item
            </Button>
          </Box>

          {/* Search Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
            <TextField
              label="Search Items"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: '40%' }}
            />
          </Box>

          {/* Loading Indicator */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredInventory.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.name}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ textAlign: 'center' }}>{item.name}</Typography>
                      <Typography variant="body1" sx={{ textAlign: 'center' }}>Quantity: {item.quantity}</Typography>
                      <Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => addItem(item)}
                          sx={{ marginRight: 1 }}
                        >
                          Add
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => removeItem(item)}
                        >
                          Remove
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      ) : (
        <Typography variant="h6" sx={{ textAlign: 'center', marginTop: 4 }}>
          Please sign in to manage your inventory.
        </Typography>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
