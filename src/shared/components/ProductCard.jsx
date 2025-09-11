import React from "react";
import { Card, CardContent, CardMedia, IconButton, Typography, Box } from "@material-ui/core";
import CloseIcon from "mdi-react/CloseIcon";

const ProductCard = ({ image, name, store, category, quantity, onCancel, withCancelButton }) => {
  return (
    <Card
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px",
        margin: "16px",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        flexShrink: 0,
        width: "100%",
      }}
    >
      <CardMedia component="img" src={image} alt={name} style={{ maxWidth: "40%", height: "auto" }} />
      <CardContent style={{ minWidth: "150px" }}>
        <Typography variant="h6">{name}</Typography>
        <Typography color="textSecondary">{store}</Typography>
        <Typography style={{ color: "#4ce1b6" }}>{category}</Typography>
        <Typography>Qty: {quantity}</Typography>
      </CardContent>
      <Box flexGrow={1} />
      {withCancelButton && (
        <IconButton onClick={onCancel} style={{ alignSelf: "flex-start" }}>
          <CloseIcon />
        </IconButton>
      )}
    </Card>
  );
};

export default ProductCard;
