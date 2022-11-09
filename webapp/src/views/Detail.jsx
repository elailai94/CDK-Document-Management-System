import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  CardHeader,
  Grid,
  Tab,
  Tabs,
} from "@mui/material";
import { makeStyles, useTheme } from "@mui/styles";

import Comments from "./detail/Comments";
import DocumentInfo from "./detail/DocumentInfo";
import FileDetails from "./detail/FileDetails";
import Metadata from "./detail/Metadata";
import Tags from "./detail/Tags";
import AuthGroupWrapper from "../components/AuthGroupWrapper";
import LoadingView from "../components/LoadingView";
import Page from "../containers/Page";
import { getDocument, deleteDocument } from "../services";

const useStyles = makeStyles((theme) => ({
  root: {},
  thumbnail: {
    maxWidth: "100%",
    maxHeight: "100%",
    height: "auto",
    border: "1px solid #888",
    margin: "auto",
  },
  cardHeader: {},
  thumbnailContainer: {
    backgroundColor: "#DDD",
    padding: theme.spacing(4),
    height: "700px",
  },
  thumbnailWrap: {
    height: "100%",
    textAlign: "center",
  },
  metadataContainer: {
    marginTop: theme.spacing(2),
  },
  tagContainer: {
    display: "flex",
    flexWrap: "wrap",
    "& > *": {
      margin: theme.spacing(0.5),
    },
  },
  detectedTextContainer: {
    backgroundColor: "#DDD",
  },
  detectedTextWrap: {
    height: "700px",
    padding: theme.spacing(4),
    overflowY: "auto",
  },
  tabs: {
    backgroundColor: "#333",
    color: "#FFF",
  },
}));

function Detail() {
  const { documentId } = useParams();
  const [documentData, setDocumentData] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const data = await getDocument(documentId);
      setDocumentData(data);
    })();
  }, [documentId]);

  const theme = useTheme();
  const classes = useStyles(theme);

  const deleteCurrentDocument = async () => {
    await deleteDocument(documentData.PK);
    navigate("/");
  };

  const getDocumentName = () => {
    if (documentData && documentData.Name) {
      return documentData.Name;
    }
    return "";
  };

  const getBreadcrumbs = () => [
    {
      name: "All Documents",
      link: "/",
    },
    {
      name: "Document",
    },
  ];

  const getActionButtons = () => {
    if (!documentData) {
      return null;
    }

    return (
      <Grid container direction="row" alignItems="center" justify="flex-end" spacing={1}>
        <AuthGroupWrapper requiredGroups={["admin", "contributor"]}>
          <Grid item>
            <Button
              variant="outlined"
              color="secondary"
              className={classes.uploadButton}
              onClick={deleteCurrentDocument}
            >
              Delete Document
            </Button>
          </Grid>
        </AuthGroupWrapper>
        <Grid item>
          <Button
            variant="outlined"
            color="primary"
            className={classes.uploadButton}
            href={documentData.Document}
            download
          >
            Download Document
          </Button>
        </Grid>
      </Grid>
    );
  };

  return (
    <Page title={getDocumentName()} actionItems={getActionButtons()} breadcrumbs={getBreadcrumbs()}>
      {documentData && documentData.FileSize && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={8}>
            <Tabs
              className={classes.tabs}
              value={selectedTab}
              indicatorColor="primary"
              onChange={(_, newIndex) => setSelectedTab(newIndex)}
              aria-label="full width tabs example"
            >
              <Tab label="Thumbnail" />
              <Tab label="Detected Text" />
            </Tabs>
            {selectedTab === 0 && (
              <div className={classes.thumbnailContainer}>
                <div className={classes.thumbnailWrap}>
                  <img
                    src={documentData.Thumbnail}
                    style={{ display: isImageLoaded ? "block" : "none" }}
                    className={classes.thumbnail}
                    onLoad={() => setIsImageLoaded(true)}
                    alt="Document Thumbnail"
                  />
                </div>
              </div>
            )}
            {selectedTab === 1 && (
              <div className={classes.detectedTextContainer}>
                <div className={classes.detectedTextWrap}>{documentData.DetectedText}</div>
              </div>
            )}
            <Comments docId={documentData.PK} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card className={classes.root} variant="outlined">
              <CardHeader title={documentData.Name} subheader={`ID: ${documentData.PK}`} />
              <DocumentInfo docInfo={documentData} />
              <Metadata metadata={documentData.Metadata} />
              <FileDetails details={documentData.FileDetails} />
              <Tags tags={documentData.Tags} />
            </Card>
          </Grid>
        </Grid>
      )}
      {documentData && !documentData.FileSize && <p>This document is still processing.</p>}
      {!documentData && <LoadingView />}
    </Page>
  );
}

export default Detail;
