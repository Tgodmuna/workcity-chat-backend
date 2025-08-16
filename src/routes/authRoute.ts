import { Router } from 'express';
import AuthService from '../services/AuthService';

const router = Router();

router.post( '/register', async ( req, res ) =>
{
  
  try {
    const payload = await AuthService.register( req.body );
    if ( !req.body ) return res.status( 400 ).send( 'invalid request' )
    const responsePayload = {
      ...payload,
      password: null
    }
    
    res.json( { responsePayload,message:'registration successful' } );
    return
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await AuthService.login(req.body.email, req.body.password);
    res.json( user );
    return
    
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
