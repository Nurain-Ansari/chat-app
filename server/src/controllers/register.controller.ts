import { NextFunction, Request, Response } from 'express';
import Register, { RegisterType } from '../models/Register.model';

export const handleRegister = async (req: Request, res: Response) => {
  try {
    const formData: RegisterType = req.body;

    const barcodeId = `CS-EVENT-2025-${Math.floor(10000 + Math.random() * 90000)}`;

    const saved = await Register.create({ ...formData, barcodeId });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: saved,
    });
  } catch {
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

export const handleUpdateRegister = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const formData = req.body;

    if (!formData._id) {
      res.status(400).json({
        success: false,
        message: 'Registration ID does not exist',
      });
      return;
    }

    const registration = await Register.findById(formData._id);

    if (!registration) {
      res.status(404).json({
        success: false,
        message: 'No registration found with provided ID',
      });
      return;
    }

    Object.assign(registration, formData);
    await registration.save();

    res.status(200).json({
      success: true,
      message: 'Registration updated successfully',
      data: registration,
    });
  } catch (error) {
    return next(error);
  }
};

export const handleGetAllRegister = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await Register.find();

    res.status(200).json({
      success: true,
      message: 'Retrive all registration successfully',
      data,
    });
  } catch (error) {
    return next(error);
  }
};

export const handleGetRegisterByBarcodeId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: barcodeId } = req.params;

    if (!barcodeId) {
      res.status(400).json({
        success: false,
        message: 'Please provide barcode ID',
      });
      return;
    }

    const data = await Register.findOne({ barcodeId });

    if (!data) {
      res.status(404).json({
        success: false,
        message: 'No registration found for the provided ID',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Retrieved data successfully',
      data,
    });
  } catch (error) {
    return next(error);
  }
};
